import FontFaceObserver from "fontfaceobserver";
import Canvas from "@/utils/Canvas";
import VerticalTextbox from "@/utils/VerticalTextbox";
import { fabric } from "fabric";
import rotateIcon from "@/assets/images/rotate.png";
let rotateImgUrl =
  "url(https://titan-img.meitudata.com/xiuxiu-pc/img/svg/mouse-icon-rotate-0.svg) 12 12,auto";
let deleIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
import lockIcon from "@/assets/images/lock-icon.svg";
import lockOpenIcon from "@/assets/images/lock-open-icon.svg";
const rotateImg = new Image();
rotateImg.src = rotateIcon;
const deleteImg = new Image();
deleteImg.src = deleIcon;
const lockImage = new Image();
lockImage.src = lockIcon;
const lockOpenImage = new Image();
lockOpenImage.src = lockOpenIcon;
// window.fabric = fabric;
let fabricObject = function (that, id = "editorCanvas") {
  /* 默认fabric配置 */
  let _fabricConfig = {
    backgroundColor: "#F7F8FF",
    preserveObjectStacking: true, // 保持原有层级
    selection: false, //取消框选
    width: 600,
    height: 800,
  };
  // 设置复制itext文本不带格式
  fabric.disableStyleCopyPaste = true;

  fabric.Object.prototype.set({
    borderColor: "rgba(0,0,0,0.8)",
    cornerColor: "#fff", //激活状态角落图标的填充颜色
    cornerStrokeColor: "rgba(0,0,0,0.8)", //激活状态角落图标的边框颜色
    borderOpacityWhenMoving: 1,
    borderScaleFactor: 1,
    cornerSize: 8,
    cornerStyle: "circle", //rect,circle
    centeredScaling: false, //角落放大缩小是否是以图形中心为放大原点
    centeredRotation: true, //旋转按钮旋转是否是左上角为圆心旋转
    transparentCorners: false, //激活状态角落的图标是否透明
    rotatingPointOffset: 20, //旋转距旋转体的距离
    // originX: "center",
    // originY: "center",
    lockUniScaling: false, //只显示四角的操作
    hasRotatingPoint: true, //是否显示旋转按钮
    showLock: true, // 控制是否显示lock
  });

  // 不显示m
  const notShowControls = ["mb", "mt"]; // 左中 右中 上中 下中
  notShowControls.forEach((control) => {
    fabric.Object.prototype.controls[control].visible = false;
  });

  // 修改删除按钮图标
  let deleteObject = function (eventData, transform) {
    const target = transform.target;
    const canvas = target.canvas;
    canvas.remove(target);
    canvas.requestRenderAll();
  };
  // 加载icon
  let renderIcon = function (ctx, left, top, styleOverride, fabricObject, img) {
    const size = 24;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(img, -size / 2, -size / 2, size, size);
    ctx.restore();
  };
  // TODO 暂时不需要删除按钮
  // fabric.Object.prototype.controls.deleteControl =
  //   fabric.Textbox.prototype.controls.deleteControl = new fabric.Control({
  //     x: 0.5,
  //     y: -0.5,
  //     offsetY: -20,
  //     cursorStyle: "pointer",
  //     mouseUpHandler: deleteObject,
  //     render: (...args) => renderIcon(...args, deleteImg),
  //     cornerSize: 24,
  //   });

  const lockIcon = {
    width: 22,
    height: 22,
  };

  //重绘旋转按钮
  fabric.Object.prototype.controls.mtr.withConnection = false;
  fabric.Object.prototype.controls.mtr = fabric.Textbox.prototype.controls.mtr =
    new fabric.Control({
      x: 0,
      y: 0.5, // 这里x y 的正负值代表4个角
      offsetY: 20,
      cursorStyle: rotateImgUrl,
      actionHandler: fabric.controlsUtils.rotationWithSnapping,
      cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
      // 渲染图标
      render: (...args) => renderIcon(...args, rotateImg),
      cornerSize: 22,
      actionName: "rotate",
    });
  //是否是初始状态
  let isInitialStatus = true;

  /* fabric对象 */
  // let _fabricObj = new fabric.Canvas(id, _fabricConfig);
  let _fabricObj = new Canvas(id, _fabricConfig);

  //对fabric.Canvas扩展
  fabric.Canvas.prototype.setZoomByCenter = function (value) {
    // this.zoomToPoint(
    //   // new fabric.Point(_fabricObj.width / 2, _fabricObj.height / 2),
    //   new fabric.Point(0, 0),
    //   value
    // );
    this.setZoom(value);
    return this;
  };

  /* 导出json时需要导出的自定义字段 */
  let _toJsonWithParams = [];

  /* 初始化 */
  const _initConfig = function (config = {}) {
    Object.assign(_fabricConfig, config);
    _fabricObj.setOptions(_fabricConfig);
  };

  /* 创建图片 */
  const _createImage = function (
    url,
    imgConfig,
    centerObject = false,
    hasControls = true,
    isBackground = false
  ) {
    return new Promise((resolve, reject) => {
      try {
        const imgdefault = new Image();
        imgdefault.src = url;
        imgdefault.onload = () => {
          fabric.Image.fromURL(
            url,
            (img) => {
              img.set(imgConfig);
              const scale = imgConfig.bboxWidth / imgdefault.width;
              img.scale(scale);
              if (!hasControls) {
                img.hasControls = hasControls;
                img.set("lockRotation", true);
                img.set("lockScalingX", true);
                img.set("lockScalingY", true);
                img.set("lockMovementX", true);
                img.set("lockMovementY", true);
              }
              if (centerObject) {
                _fabricObj.centerObject(img);
              }
              if (isBackground) {
                _fabricObj.setBackgroundImage(img);
              }
              resolve(img);
              const imgInstance = _fabricObj.add(img); // 添加背景图
              imgInstance.renderAll();
            },
            { crossOrigin: "anonymous" }
          );
        };
      } catch (e) {
        reject();
      }
    });
  };

  /* 创建文本 */
  const _createTextBox = function (
    title,
    txtConfig,
    centerObject = false,
    hasControls = true
  ) {
    let textInstance = new fabric.Textbox(title, {
      ...txtConfig,
      splitByGrapheme: true,
    });
    if (centerObject) {
      _fabricObj.centerObject(textInstance);
    }
    if (!hasControls) {
      textInstance.hasControls = hasControls;
      textInstance.set("lockRotation", true);
      textInstance.set("lockScalingX", true);
      textInstance.set("lockScalingY", true);
      textInstance.set("lockMovementX", true);
      textInstance.set("lockMovementY", true);
    }
    _fabricObj.add(textInstance);
    _fabricObj.renderAll();
    return textInstance;
  };

  /* 鼠标事件监听相关--开始 */
  // _fabricObj.on("object:modified", function (e) {});
  // _fabricObj.on("object:added", function () {});
  // _fabricObj.on("object:removed", function () {});
  // _fabricObj.on("object:rotating", function () {});
  // _fabricObj.on("mouse:down", (e) => {
  //   if (e && e.target && e.target.selectable) {

  //   }
  // });
  // _fabricObj.on("mouse:move", function (e) {
  //   if (e && e.target) {
  //   }
  // });
  // _fabricObj.on("mouse:up", (e) => {
  //   if (e && e.target) {
  //   }
  // });
  // _fabricObj.on("object:selected", (e) => {
  //   if (e && e.target) {
  //   }
  // });
  /* 鼠标监控相关--结束 */

  let _config = {};
  //重新加载相关数据初始化
  let initialize = function () {
    if (isInitialStatus) {
      return;
    }
    let json = _config.canvasState[0];
    _fabricObj.clear();
    _config.isStart = false;
    _config.currentStateIndex = -1;
    _config.canvasState = [];
    isInitialStatus = true;
    _fabricObj.loadFromJSON(json, () => {}, canvasLoadFromJsonTxtLoadFont);
  };

  //获取画布图片的base64
  let getImgBase64Url = function () {
    let currentActive = _fabricObj.getObjects()[0];
    let width = currentActive.oldWidth * currentActive.scaleX;
    let height = currentActive.oldHeight * currentActive.scaleY;
    let zoom = _fabricObj.getZoom();
    if (zoom != 1) {
      setZoom(1);
    }
    //转换成base64
    let imgURL = _fabricObj.toDataURL({
      format: "jpeg",
      quality: 1,
      multiplier: 1,
      left: 0,
      top: 0,
      width: width,
      height: height,
    });
    setZoom(zoom);
    return imgURL;
  };

  //设置缩放
  let setZoom = function (num) {
    _fabricObj.setZoomByCenter(num);
  };

  // 设置缩放
  let getZoom = function (type) {
    return _fabricObj.getZoom();
  };

  // 修改画布尺寸
  let setDimensions = function (width, height) {
    _fabricObj.setDimensions({
      width,
      height,
    });
  };

  //设置导出json时需要导出的自定义字段
  let setToJsonWithParams = function (list) {
    _toJsonWithParams = _toJsonWithParams.concat(list);
  };
  //删除元素
  let delItem = function (order) {
    let objs = _fabricObj.getObjects().filter((e) => {
      return e && e.order == order;
    });
    if (objs && objs.length > 0) {
      _fabricObj.remove(objs[0]);
      _fabricObj.renderAll();
    }
  };
  // 清空画布
  let clear = function () {
    _fabricObj.clear();
  };

  //获取当前选中的元素
  let getActiveObj = function () {
    return _fabricObj.getActiveObject();
  };

  //设置元素属性值
  let setActiveObjCss = function (obj) {
    let currentActive = getActiveObj();
    if (currentActive) {
      // currentActive.setOptions(obj)
      currentActive.set(obj.cssName, obj.cssVlaue).setCoords();
      _fabricConfig.renderAll();
    }
  };

  //加载json到canvas时加载每个元素的事件,用于异步加载字体
  let canvasLoadFromJsonTxtLoadFont = function (o, object) {
    if (
      (object.isType("i-text") || object.isType("textbox")) &&
      o.fontFamily == "" &&
      o.realFontFamily != ""
    ) {
      _loadFont(object, o.realFontFamily);
    }
  };

  //加载字体文件
  let _loadFont = function (instance, fontFamily) {
    let font = fontFamily;
    var myfont = new FontFaceObserver(font);
    myfont
      .load(null, 100000)
      .then(function () {
        console.log(instance, font);
        instance.set("fontFamily", font);
        _fabricObj.requestRenderAll();
        _loadFontSuccess(instance);
      })
      .catch(function (e) {
        console.log(e);
      });
  };

  //加载字体成功事件回调
  let _loadFontSuccess = function (currentActive) {
    console.log("加载字体成功");
    let text = currentActive.text;
    currentActive.set("text", "").setCoords();
    currentActive.set("text", text).setCoords();
    _fabricObj.renderAll();
  };

  return {
    initFabricConfig: _initConfig,
    fabricInstance: _fabricObj,
    initialize: initialize,
    getImgBase64Url: getImgBase64Url,
    setZoom: setZoom,
    getZoom: getZoom,
    setDimensions: setDimensions,
    setToJsonWithParams: setToJsonWithParams,
    delItem: delItem,
    clear: clear,
    createImage: _createImage,
    createTextBox: _createTextBox,
    getActiveObj: getActiveObj,
    setActiveObjCss: setActiveObjCss,
    loadFont: _loadFont,
  };
};
export { fabricObject };
