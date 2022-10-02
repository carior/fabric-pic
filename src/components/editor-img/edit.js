// canvas 相关操作
import defaultImg from "@/assets/images/default-book-cover.png";
let fabricCommon = function (fabricObject, that) {
  //tojson包含自定义的属性内容
  let toJsonWithParams = [
    "realLeft",
    "realTop",
    "realType",
    "realWidth",
    "realHeight",
    "order",
    "oldSrc",
    "oldId",
    "oldPictureName",
    "oldPictureNum",
    "oldPictType",
    "oldUserId",
    "lockUniScaling",
    "PictureName",
    "PictureNum",
    "id",
    "pictType",
    "userId",
    "aCoords",
    "oldWidth", //图片本身真实宽度
    "oldHeight", //图片本身真实高度
    "title",
    "oldRealUrl",
    "realUrl",
    "bboxWidth", //图片要显示的宽度
    "bboxHeight", //图片要显示的高度
    "realFontFamily", //用于存储选中的字体,在字体文件加载完成之后替换到fontFamiy
    "lockScalingY",
    "lockScalingX",
    "lockMovementY",
    "lockMovementX",
    "layerIsEdit",
    "isGif",
    "fontDir",
  ];
  let _fabricInstance = fabricObject;
  let _canvasObject = _fabricInstance.fabricInstance;

  //记录偏移量x,y的值
  let _offsetObj = { offsetX: 0, offsetY: 0 };

  //文本类型
  let txtList = ["bookMame", "authorName"];
  // 数据渲染
  let addObject = function (dataList) {
    let cloneJson = JSON.parse(JSON.stringify(dataList));
    if (cloneJson.length == 0) {
      createImage(
        {
          title: "背景1",
          bboxWidth: "600",
          bboxHeight: "800",
          order: "0",
          type: "image",
          bookImgUrl: defaultImg,
          hasControls: false,
          isCenter: true,
        },
        dataList
      );
    } else {
      loadDataToCanvas(cloneJson);
    }

    _canvasObject.renderAll();
  };

  // 处理加载过来的数据,递归加载
  let loadDataToCanvas = function (dataList) {
    if (dataList && dataList.length > 0) {
      let obj = dataList[0];
      if (obj.type == "image") {
        //图片
        createImage(obj, dataList);
      } else {
        //文字
        createTxt(obj, dataList);
      }
    } else {
    }
  };

  //创建图片,dataList为空是默认图片
  let createImage = function (obj, dataList) {
    let order =
      (_canvasObject.getObjects() && _canvasObject.getObjects().length) || 0;
    let item = obj;
    let url = item.bookImgUrl;
    let imgConfig = {
      top: top,
      order: order,
      id: item.id,
      PictureName: item.PictureName,
      PictureNum: item.motherSetNumRef,
      userId: item.userId,
      pictType: item.pictType,
      angle: 0,
      realLeft: parseInt(item.bboxX1),
      realTop: parseInt(item.bboxY1),
      realType: item.type,
      title: item.title,
      realUrl: item.bookImgUrl,
      bboxWidth: item.bboxWidth,
      bboxHeight: item.bboxHeight,
      lockScalingY: false,
      lockScalingX: false,
      lockMovementY: false,
      lockMovementX: false,
      layerIsEdit: item.layerIsEdit,
      isGif: item.isGif,
    };
    _fabricInstance
      .createImage(url, imgConfig, item.isCenter, item.hasControls)
      .then((img) => {
        if (!item.bboxWidth) {
          setActiveSelect(order);
          canvasObjectSelected();
        }
        if (dataList.length) {
          loadDataCallback(dataList);
        }
      });
  };

  //创建文本,dataList不传则为新增/或者替换
  let createTxt = function (item, dataList) {
    let order =
      (_canvasObject.getObjects() && _canvasObject.getObjects().length) || 0;
    if (that.getFont) {
      let result = that.getFont(item.fontType);
      if (!result) {
        // item.fontType = "FZZCHJW--GB1-0";
        item.fontType = "Microsoft Yahei";
      }
    }
    let scale = !item.fontSize || item.fontSize >= 12 ? 1 : item.fontSize / 12;
    let txtConfig = {
      left:
        parseInt(item.bboxX1) +
        parseInt(item.bboxWidth) / 2 +
        _offsetObj.offsetX, //+parseInt(item.bboxWidth)/2
      top:
        parseInt(item.bboxY1) +
        parseInt(item.bboxHeight) / 2 +
        _offsetObj.offsetY, //+parseInt(item.bboxWidth)/2
      order: order,
      fill: item.color, //content.color
      fontSize: item.fontSize ? item.fontSize : 20,
      angle: 0,
      fontFamily: "", //content.fontFamily
      realFontFamily: item.fontType,
      fontWeight: item.fontBold == "1" ? "bold" : "normal",
      fontStyle: item.fontItalic == "0" ? "normal" : "italic",
      realLeft: parseInt(item.bboxX1),
      realTop: parseInt(item.bboxY1),
      realType: item.type,
      title: item.title,
      realWidth: parseInt(item.bboxWidth),
      realHeight: parseInt(item.bboxHeight),
      // lockScalingY: true,
      // lockScalingX: true,
      lockMovementY: false,
      lockMovementX: false,
      width: parseInt(item.bboxWidth),
      height: parseInt(item.bboxHeight),
      scaleX: scale,
      scaleY: scale,
      layerIsEdit: item.layerIsEdit,
      isGif: item.isGif,
      fontDir: item.fontDir,
    };
    let txtInstabce = _fabricInstance.createTextBox(
      item.text,
      txtConfig,
      item.isCenter
    );
    if (item.fontType) {
      _fabricInstance.loadFont(txtInstabce, item.fontType);
    }
    txtInstabce.on("editing:exited", function () {
      let obj = _canvasObject.getActiveObject();
      checkTxt(obj);
    });
    if (item.isCenter) {
      // setActiveSelect(order);
      canvasObjectSelected();
    }
    if (dataList.length) {
      loadDataCallback(dataList);
    }
  };

  // 编辑文本的时候添加校验
  let checkTxt = function (obj) {
    if (obj && obj.text && obj.realType && that.check_text) {
      that.check_text({ txt: obj.text, type: obj.realType });
    }
  };

  //加载数据到画布的回调函数,适用于loadDataToCanvas方法
  let loadDataCallback = function (list) {
    list.shift();

    loadDataToCanvas(list);
  };

  _canvasObject.on("mouse:down", (opt) => {
    that.panning = true;
  });
  // _canvasObject.on("mouse:move", function (e) {
  // });
  _canvasObject.on("mouse:up", (opt) => {
    that.panning = false;
    that.showAngle = false;
  });
  _canvasObject.on("object:rotating", (opt) => {
    let currentActive = _fabricInstance.getActiveObj();
    that.angleBox.angle = parseInt(currentActive.angle);
    that.showAngle = true;
    that.angleBox.left = opt.e.x - 470 + 10;
    that.angleBox.top = opt.e.y + 10;
  });
  // _canvasObject.on("object:selected", (e) => {
  //   if (e && e.target) {
  //   }
  // });
  // _canvasObject.on("object:modified", function (e) {
  //   if (e && e.target) {
  //     console.log("modified");
  //   }
  // });
  // _canvasObject.on("object:scaled", (e) => {
  // });

  //选中元素事件,重置realLeft和realTop
  let canvasObjectSelected = function () {
    let currentActive = _fabricInstance.getActiveObj();
    if (currentActive) {
      let left, top, width, height;
      if (currentActive.type == "image") {
        //图片
        width = currentActive.oldWidth * currentActive.scaleX;
        height = currentActive.oldHeight * currentActive.scaleY;
        left =
          currentActive.left -
          _offsetObj.offsetX -
          (currentActive.width * currentActive.scaleX) / 2;
        top =
          currentActive.top -
          _offsetObj.offsetY -
          (currentActive.height * currentActive.scaleY) / 2;
        currentActive.realWidth = width;
        currentActive.realHeight = height;
      } else {
        //文本,不需要再去减二分之一的宽高
        left =
          currentActive.left -
          parseInt(currentActive.width) / 2 -
          _offsetObj.offsetX;
        top =
          currentActive.top -
          parseInt(currentActive.height) / 2 -
          _offsetObj.offsetY;
      }
      currentActive.realTop = top;
      currentActive.realLeft = left;
      _canvasObject.renderAll();
      console.log(currentActive, "currentActive");
      that.setActiveObjectCallback(currentActive);
    }
  };

  //修改属性值
  let setCss = function (obj) {
    let currentActive = _canvasObject.getActiveObject();
    if (!currentActive) {
      return;
    }
    //是否是背景,是否是编辑修改图片功能
    if (currentActive.realType == "1-1") {
      //背景,只能替换或者恢复图片
      if (obj.cssName != "src" && obj.cssName != "resetSrc") {
        return;
      }
    }
    //图片和文字都有的操作,需要重置位置的
    if (obj.cssName == "left" || obj.cssName == "top") {
      updateLeftOrTop(obj, currentActive);
    } else if (obj.cssName == "src") {
      //更换图片
      updatePic(obj, currentActive);
      return;
    } else if (obj.cssName == "resetSrc") {
      return;
    } else if (obj.cssName == "width" || obj.cssName == "height") {
      updateWidthOrHeight(obj, currentActive);
    } else {
      if (currentActive.isType("i-text") || currentActive.isType("textbox")) {
        //剩下的就是文本类的操作
        updateTxtCss(obj, currentActive);
      } else {
        currentActive.set(obj.cssName, obj.cssValue).setCoords();
      }
    }
    _canvasObject.renderAll();
  };

  //更新文本类属性值
  let updateTxtCss = function (obj, currentActive, isSetSelect = true) {
    //字体类的修改
    if (obj.cssName != "realFontFamily") {
      //不是修改字体样式
      currentActive.set(obj.cssName, obj.cssValue).setCoords();
      // if (obj.cssName == "fontSize"&&obj.cssValue<12) {//修改字体大小,且字体大小是小于12的
      //     let scale =obj.cssValue/12;
      //     console.log(scale);
      //     currentActive.scale(scale).setCoords();
      // }
      // 解决切换颜色值,字体大小,下划线,加粗等无法重绘文字内容的问题
      let stroke = currentActive.stroke;
      if (stroke !== "#000000") {
        currentActive.set("stroke", "#000000");
      } else {
        currentActive.set("stroke", "#ffffff");
      }
      currentActive.set("stroke", stroke);
      // if (currentActive.fontFamily == "黑体") {
      //     currentActive.set("fontFamily", "微软雅黑").setCoords();
      // } else {
      //     currentActive.set("fontFamily", "黑体").setCoords();
      // }
      // currentActive.set("fontFamily", oldValue).setCoords();
    } else {
      //修改字体样式
      currentActive.set(obj.cssName, obj.cssValue).setCoords();
      console.log("_fabricInstance.loadFont");
      _fabricInstance.loadFont(currentActive, obj.cssValue);
    }
    if (isSetSelect) {
      canvasObjectSelected();
    }
  };

  //更换图片
  let updatePic = function (obj, currentActive) {
    let src = currentActive.getSrc();
    //判断是否更换的同一张
    if (src == obj.cssValue) {
      return;
    }
    currentActive.set("oldSrc", src); //跨域转换后的url
    currentActive.set("oldId", currentActive.id);
    currentActive.set("oldPictureName", currentActive.PictureName);
    currentActive.set("oldPictureNum", currentActive.PictureNum);
    currentActive.set("oldPictType", currentActive.pictType);
    currentActive.set("oldUserId", currentActive.userId);
    let content = obj.cssValue;
    currentActive.set({
      id: content.id,
      PictureName: content.PictureName,
      PictureNum: content.motherSetNumRef,
      userId: content.userId,
      pictType: content.type,
      oldRealUrl: currentActive.realUrl, //替换前的真实url
      realUrl: content.bookImgUrl, //替换后的真实url
    });
    let width = currentActive.realWidth;
    let url =
      "./app/bannerMaterialManager/getPicture?pictureUrl=" + content.bookImgUrl; //跨域转换后的url
    currentActive.setSrc(url, function (e) {
      let scaleX = width / e.width;
      let scaleY = scaleX;
      if (currentActive.realType == "1-1") {
        scaleY = currentActive.realHeight / e.height;
      }
      currentActive.set("scaleX", scaleX).setCoords();
      currentActive.set("scaleY", scaleY).setCoords();
      currentActive.set("oldWidth", parseInt(e.width)).setCoords();
      currentActive.set("oldHeight", parseInt(e.height)).setCoords();
      _canvasObject.renderAll();
      // _fabricInstance.updateCanvasState();
      canvasObjectSelected();
    });
    return;
  };

  //更新left/top的值
  let updateLeftOrTop = function (obj, currentActive) {
    let value;
    if (currentActive.isType("image")) {
      if (obj.cssName == "top") {
        value =
          currentActive.realTop +
          (currentActive.height * currentActive.scaleY) / 2 +
          _offsetObj.offsetY;
      } else if (obj.cssName == "left") {
        value =
          currentActive.realLeft +
          (currentActive.width * currentActive.scaleX) / 2 +
          _offsetObj.offsetX;
      }
    } else {
      if (obj.cssName == "top") {
        value =
          currentActive.realTop +
          parseInt(currentActive.height) / 2 +
          _offsetObj.offsetY;
      } else if (obj.cssName == "left") {
        value =
          currentActive.realLeft +
          parseInt(currentActive.width) / 2 +
          _offsetObj.offsetX;
      }
    }
    currentActive.set(obj.cssName, value).setCoords();
  };

  //更新width/height的值
  let updateWidthOrHeight = function (obj, currentActive) {
    if (obj.cssName == "width") {
      if (currentActive.isType("image")) {
        let scaleX = currentActive.realWidth / currentActive.oldWidth;
        let scaleY = (scaleX * currentActive.scaleY) / currentActive.scaleX;
        currentActive.set("scaleX", scaleX).setCoords();
        currentActive.set("scaleY", scaleY).setCoords();
        canvasObjectSelected();
      }
    } else {
      if (currentActive.isType("image")) {
        let scaleY = currentActive.realHeight / currentActive.oldHeight;
        let scaleX = (scaleY * currentActive.scaleX) / currentActive.scaleY;
        currentActive.set("scaleY", scaleY).setCoords();
        currentActive.set("scaleX", scaleX).setCoords();
        canvasObjectSelected();
      }
    }
    //文本类修改
    currentActive.set(obj.cssName, obj.cssValue).setCoords();
  };

  //设置选中项
  let setActiveSelect = function (order) {
    _fabricInstance.setActiveSelect(order).then((res) => {
      canvasObjectSelected();
    });
  };

  //导出json数据
  let toJSon = function () {
    let canvasList = _canvasObject.toJSON(toJsonWithParams).objects;
    let result = [];
    canvasList.forEach((item) => {
      console.log(item);
      let obj = {};
      let width = 0;
      let height = 0;
      if (item.realType.indexOf("3-") < 0) {
        width = item.oldWidth * item.scaleX;
        height = item.oldHeight * item.scaleY;
        obj.bookImgUrl = item.realUrl;
        obj.motherSetNumRef = item.PictureNum;
        obj.pictType = item.pictType;
        obj.PictureName = item.PictureName;
        obj.id = item.id;
        obj.PictureName = item.PictureName;
      } else {
        width = item.width ? item.width : 0;
        height = item.height ? item.height : 0;
        obj.fontType = item.realFontFamily;
        obj.color = item.fill;
        obj.fontBold = item.fontWeight == "bold" ? 1 : 0;
        obj.fontItalic = item.fontStyle != "normal" ? 1 : 0;
        obj.fontSize = item.fontSize;
        obj.text = item.text;
      }
      obj.bboxWidth = width;
      obj.bboxHeight = height;
      obj.bboxX1 = item.realLeft;
      obj.bboxX2 = item.realLeft + width;
      obj.bboxY1 = item.realTop;
      obj.bboxY2 = item.realTop + height;
      obj.isGif = item.isGif;
      obj.layerIsEdit = item.layerIsEdit;
      obj.order = item.order;
      obj.type = item.realType;
      obj.userId = item.userId;
      obj.fontDir = item.fontDir;
      result.push(obj);
    });
    return result;
  };

  //导出图片
  let downLoadImage = function () {
    let imgURL = _fabricInstance.getImgBase64Url();
    dowmLoadFunc(imgURL);
  };

  //下载通用方法,模拟a标签
  const dowmLoadFunc = (url, MIME_TYPE = "image/png") => {
    //创建一个a链接，模拟点击下载
    let dlLink = document.createElement("a");
    let filename = "合成图_" + new Date().getTime() + ".png";
    dlLink.download = filename;
    dlLink.href = url;
    dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(
      ":"
    );
    document.body.appendChild(dlLink);
    dlLink.click();
    document.body.removeChild(dlLink);
  };

  //画布缩放
  let setZoom = function (value) {
    _fabricInstance.setZoom(value);
  };

  //画布缩放
  let zoomIt = function (type) {
    let zoom = _fabricInstance.getZoom(); // 获取画布当前缩放级别
    let _zoom = 1;
    if (type == "small") {
      _zoom = Math.round((zoom - 0.1) * 100) / 100;
      if (_zoom <= 0.1) {
        that.$message("不能在缩小了");
        return;
      }
    } else {
      _zoom = Math.round((zoom + 0.1) * 100) / 100;
      if (_zoom >= 1.75) {
        that.$message("不能在放大了");
        return;
      }
    }
    handlezoomIt(_zoom);
    // _fabricInstance.setWidth(600 * _zoom);
    // _fabricInstance.setHeight(800 * _zoom);
  };

  // 处理缩放画布
  let handlezoomIt = function (_zoom) {
    that.zoomCounter = Math.round(_zoom * 100);
    _fabricInstance.setZoom(_zoom); // 设置画布缩放级别
    // _fabricInstance.setDimensions(600 * _zoom, 800 * _zoom);
  };

  return {
    addObject: addObject,
    toJSon: toJSon,
    setActiveSelect: setActiveSelect,
    setCss: setCss,
    setZoom: setZoom,
    handlezoomIt: handlezoomIt,
    zoomIt: zoomIt,
    createImage: createImage,
    createTxt: createTxt,
    downLoadImage: downLoadImage,
    undo: _fabricInstance.undo,
    redo: _fabricInstance.redo,
    initialize: _fabricInstance.initialize,
    toggleVisiable: _fabricInstance.toggleVisiable,
    updateLevel: _fabricInstance.updateLevel,
    delItem: _fabricInstance.delItem,
    flipActiveObj: _fabricInstance.flipActiveObj,
  };
};
export { fabricCommon };
