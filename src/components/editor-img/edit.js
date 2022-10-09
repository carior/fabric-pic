// canvas 相关操作
import defaultImg from "@/assets/images/default-book-cover.png";
let fabricCommon = function (fabricObject, that) {
  //tojson包含自定义的属性内容
  let toJsonWithParams = [
    "title", // 图片标题
    "bboxWidth", //图片要显示的宽度
    "bboxHeight", //图片要显示的高度
    "order", // 序号
    "lockUniScaling",
    "id",
    "left",
    "top",
    "realUrl", // 底图的url
    "realFontFamily", //用于存储选中的字体,在字体文件加载完成之后替换到fontFamiy
    "lockScalingY",
    "lockScalingX",
    "lockMovementY",
    "lockMovementX",
    "editable", // 文本框是否可以编辑
    "fontDir", // 文字方向
    "text", // 文本内容
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
          left: 0,
          top: 0,
          order: "0",
          type: "image",
          bookImgUrl: defaultImg,
          hasControls: false,
          isCenter: true,
          isBackground: true
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
      if (obj.type == "image" || obj.type == "logo") {
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
      // left: parseInt(item.bboxWidth) / 2 + item.left,
      // top: parseInt(item.bboxHeight) / 2 + item.top,
      left: item.left || 0,
      top: item.top || 0,
      order: order,
      angle: 0,
      title: item.title,
      realUrl: item.bookImgUrl,
      bboxWidth: item.bboxWidth,
      bboxHeight: item.bboxHeight,
      lockScalingY: false,
      lockScalingX: false,
      lockMovementY: false,
      lockMovementX: false,
    };
    _fabricInstance
      .createImage(
        url,
        imgConfig,
        item.isCenter,
        item.hasControls,
        item.isBackground
      )
      .then((img) => {
        // if (!item.bboxWidth) {
        //   setActiveSelect(order);
        //   canvasObjectSelected();
        // }
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
      // left: parseInt(item.bboxWidth) / 2 + item.left,
      // top: parseInt(item.bboxHeight) / 2 + item.top,
      left: item.left,
      top: item.top,
      order: order,
      fill: item.color, //content.color
      fontSize: item.fontSize ? item.fontSize : 20,
      angle: 0,
      fontFamily: "", //content.fontFamily
      realFontFamily: item.fontType,
      fontWeight: item.fontBold == "1" ? "bold" : "normal",
      fontStyle: item.fontItalic == "0" ? "normal" : "italic",
      title: item.title,
      lockMovementY: false,
      lockMovementX: false,
      width: parseInt(item.bboxWidth),
      height: parseInt(item.bboxHeight),
      scaleX: scale,
      scaleY: scale,
      editable: item.editable,
      fontDir: item.fontDir,
    };
    let txtInstabce = _fabricInstance.createTextBox(
      item.text,
      txtConfig,
      item.isCenter,
      item.hasControls
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
    that.check_text({ txt: obj.text});
  };

  //加载数据到画布的回调函数,适用于loadDataToCanvas方法
  let loadDataCallback = function (list) {
    list.shift();

    loadDataToCanvas(list);
  };

  _canvasObject.on("mouse:down", (opt) => {
    that.panning = true;
  });
  _canvasObject.on("mouse:move", function (e) {
    return
    // 拖动限制
    let currentActive = _fabricInstance.getActiveObj();
    if (!currentActive) return;
    if (currentActive?.hasControls || currentActive?.type != "image") {
      // 阻止对象移动到画布外面
      let padding = 0; // 内容距离画布的空白宽度，主动设置
      var obj = e.target;
      if (
        obj.currentHeight > obj.canvas.height - padding * 2 ||
        obj.currentWidth > obj.canvas.width - padding * 2
      ) {
        return;
      }
      obj.setCoords();
      if (
        obj.getBoundingRect().top < padding ||
        obj.getBoundingRect().left < padding
      ) {
        obj.top = Math.max(
          obj.top,
          obj.top - obj.getBoundingRect().top + padding + 100 // 100是假设的logo高度
        );
        obj.left = Math.max(
          obj.left,
          obj.left - obj.getBoundingRect().left + padding
        );
      }
      if (
        obj.getBoundingRect().top + obj.getBoundingRect().height >
          obj.canvas.height - padding ||
        obj.getBoundingRect().left + obj.getBoundingRect().width >
          obj.canvas.width - padding
      ) {
        obj.top = Math.min(
          obj.top,
          obj.canvas.height -
            obj.getBoundingRect().height +
            obj.top -
            obj.getBoundingRect().top -
            padding
        );
        obj.left = Math.min(
          obj.left,
          obj.canvas.width -
            obj.getBoundingRect().width +
            obj.left -
            obj.getBoundingRect().left -
            padding
        );
      }
    }
  });
  _canvasObject.on("mouse:up", (e) => {
    that.panning = false;
    that.showAngle = false;
    if (e && e.target) {
      canvasObjectSelected();
    }
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

  //选中元素事件
  let canvasObjectSelected = function () {
    let currentActive = _fabricInstance.getActiveObj();
    if (currentActive) {
      _canvasObject.renderAll();
      // console.log(currentActive, "currentActive");
      that.setActiveObjectCallback(currentActive);
    }
  };

  //修改属性值
  let setCss = function (obj) {
    let currentActive = _canvasObject.getActiveObject();
    if (!currentActive) {
      return;
    }
    if (obj.cssName == "src") {
      //更换图片
      updatePic(obj, currentActive);
      return;
    } else if (obj.cssName == "resetSrc") {
      return;
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
      console.log("修改字体样式",obj.cssName, obj.cssValue);
      _fabricInstance.loadFont(currentActive, obj.cssValue);
    }
    if (isSetSelect) {
      canvasObjectSelected();
    }
  };

  //更换图片
  let updatePic = function (obj, currentActive) {};

  //设置选中项
  let setActiveSelect = function (order) {
    _fabricInstance.setActiveSelect(order).then((res) => {
      canvasObjectSelected();
    });
  };

  //导出json数据
  let toJSon = function () {
    // let canvasList = _canvasObject.toJSON(toJsonWithParams).objects;
    // let result = [];
    // canvasList.forEach((item) => {
    //   console.log(item, 'item');
    //   let obj = {};
    //   let width = 0;
    //   let height = 0;
    //   if (item.realType.indexOf("3-") < 0) {
    //     width = item.oldWidth * item.scaleX;
    //     height = item.oldHeight * item.scaleY;
    //     obj.bookImgUrl = item.realUrl;
    //     obj.id = item.id;
    //   } else {
    //     width = item.width ? item.width : 0;
    //     height = item.height ? item.height : 0;
    //     obj.fontType = item.realFontFamily;
    //     obj.color = item.fill;
    //     obj.fontBold = item.fontWeight == "bold" ? 1 : 0;
    //     obj.fontItalic = item.fontStyle != "normal" ? 1 : 0;
    //     obj.fontSize = item.fontSize;
    //     obj.text = item.text;
    //   }
    //   obj.bboxWidth = width;
    //   obj.bboxHeight = height;
    //   obj.editable = item.editable;
    //   obj.order = item.order;
    //   obj.type = item.realType;
    //   obj.fontDir = item.fontDir;
    //   result.push(obj);
    // });
    // return result;
    return _canvasObject.toObject();
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

  // 获取图片的url
  let getUrl = function () {
    let imgURL = _fabricInstance.getImgBase64Url();
    return imgURL;
  };

  // 画布缩放
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
    // _fabricInstance.setDimensions(600 * _zoom, 800 * _zoom);
  };

  // 处理缩放画布
  let handlezoomIt = function (_zoom) {

    const objects = _canvasObject.getObjects();
    for (let i in objects) {
    //   let left = objects[i].left;
    //   let top = objects[i].top;
    //   console.log(left, 'left');
    //   console.log(top, 'top');
    //   let tempLeft = left * _zoom;
    //   let tempTop = top * _zoom;
      // objects[i].left = 0;
      // objects[i].top = 0;
    //   objects[i].setCoords();
    //   // if(objects[i].title == '背景1') {
    //   //   console.log(objects[i].bboxWidth * _zoom);
    //   //   console.log(objects[i]);
    //   // //   objects[i].width = objects[i].bboxWidth * _zoom;
    //   // //   objects[i].height = objects[i].bboxHeight * _zoom;
    //   // }
    }
    that.zoomCounter = Math.round(_zoom * 100);
    _fabricInstance.setZoom(_zoom); // 设置画布缩放级别
    _fabricInstance.setDimensions(600 * _zoom, 800 * _zoom);
    // _canvasObject.renderAll();
    // _canvasObject.calcOffset();
  };

  return {
    addObject: addObject,
    toJSon: toJSon,
    setActiveSelect: setActiveSelect,
    setCss: setCss,
    handlezoomIt: handlezoomIt,
    zoomIt: zoomIt,
    createImage: createImage,
    createTxt: createTxt,
    downLoadImage: downLoadImage,
    getUrl: getUrl,
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
