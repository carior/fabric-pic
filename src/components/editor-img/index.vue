<template>
  <div class="editor-img">
    <div class="editor-img-sider">
      <div class="type">
        <ul>
          <li
            @click="change_type(key)"
            v-for="(item, key) in typeList"
            :key="item.name"
            :class="[activeType == key ? 'active' : '']"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <div class="type-detail">
        <!-- 模板 -->
        <div class="tpls-box" v-if="activeType == 'tpl'">
          <div v-for="item in typeList[activeType].list" :key="item.name">
            <div class="title">
              <span class="tit">{{ item.name }}</span>
              <span class="more" @click="look_more">查看更多</span>
            </div>
            <ul class="tpls">
              <li
                v-for="(img, tplName) in item.tpls"
                :key="tplName"
                :class="[tplName == activeTpl ? 'active' : '']"
              >
                <img
                  @click="generate_tpl(img, tplName)"
                  :src="img.tplImgs"
                  alt=""
                />
                <!-- <img @click="generate_tpl" src="../../assets/images/50.jpg" alt=""> -->
              </li>
            </ul>
          </div>
        </div>
        <!-- 文字 -->
        <div class="tpls-box" v-if="activeType == 'itext'">
          <div v-for="(item, index) in typeList['tpl'].list" :key="index">
            <div class="title">
              <span class="tit">{{ item.name }}</span>
              <span class="more" @click="look_more">查看更多</span>
            </div>
            <ul class="tpls">
              <li v-for="(img, i) in item.tpls" :key="i">
                <img @click="generate_tpl(img)" :src="img.tplImgs" alt="" />
                <!-- <img @click="generate_tpl" src="../../assets/images/50.jpg" alt=""> -->
              </li>
            </ul>
          </div>
        </div>
        <div class="botton-btn">
          <el-button
            class="botton-btn-remove"
            type="primary"
            @click="handle_remove_tpl"
            >移除模板</el-button
          >
        </div>
      </div>
    </div>
    <div class="editor-img-body">
      <div class="canvas">
        <canvas ref="canvas" id="editorCanvas"></canvas>
      </div>
      <canvas
        id="c"
        width="400"
        height="300"
        style="border: 1px solid #ccc"
      ></canvas>
      <el-button
        :disabled="showSaveBtn"
        class="save_btn"
        type="primary"
        @click="handleSaveTpl"
        >保存封面</el-button
      >
      <div class="l-navigator" slot="reference">
        <i class="el-icon-caret-left" @click="zoomIt('small')"></i>
        <el-popover
          width="100"
          trigger="hover"
          popper-class="ratio-popover"
          :visible-arrow="false"
        >
          <ul class="ratio-box">
            <li
              v-for="ratio in ratioList"
              :key="ratio.value"
              @click="change_size(ratio.value)"
            >
              {{ ratio.label }}
            </li>
          </ul>
          <!-- <div class="l-navigator" slot="reference">
          <i class="el-icon-caret-left" @click="zoomIt('small')"></i> -->
          <span slot="reference"> {{ zoomCounter }} % </span>
          <!-- <i class="el-icon-caret-right" @click="zoomIt('big')"></i>
        </div> -->
        </el-popover>
        <i class="el-icon-caret-right" @click="zoomIt('big')"></i>
      </div>
    </div>
    <div class="right-box">
      <div class="pic-detail" v-if="activeType == 'tpl'">
        <div class="tit">图片尺寸</div>
        <div>宽：{{ picDetail.width }}px 高：{{ picDetail.height }}px</div>
      </div>
      <div class="text-edit" v-if="activeType == 'itext'">
        <div class="top">
          <el-button class="add-text" type="primary" @click="add_text"
            >添加文字</el-button
          >
        </div>
        <el-form ref="form" label-width="100px">
          <el-form-item label="字体：">
            <el-select
              v-model="textForm.fontFamilies"
              placeholder="请选择字体"
              @change="changeFontFamily"
            >
              <el-option
                v-for="item in fontFamilies"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字号：">
            <el-select
              v-model="textForm.fontSizes"
              placeholder="选择字号"
              @change="changeFontSize"
            >
              <el-option
                v-for="item in fontSizes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label-width="0">
            <el-tag class="font-set" @click="change_undeline">下划线</el-tag>
            <el-tag class="font-set" @click="change_bold">加粗</el-tag>
            <el-tag class="font-set" @click="change_alignItem('left')"
              >左对齐</el-tag
            >
            <el-tag class="font-set" @click="change_alignItem('center')"
              >居中</el-tag
            >
            <el-tag class="font-set" @click="change_alignItem('right')"
              >右对齐</el-tag
            >
            <el-popover placement="bottom" title="" width="200" trigger="click">
              <c-progress
                class="c-progress"
                :percent="70"
                @percentChange="change_letterSpace"
              />
              <el-tag slot="reference" class="font-set">字间距</el-tag>
            </el-popover>
            <el-popover placement="bottom" title="" width="200" trigger="click">
              <c-progress
                class="c-progress"
                :percent="70"
                @percentChange="change_lineHeight"
              />
              <el-tag slot="reference" class="font-set">行间距</el-tag>
            </el-popover>
            <el-tag class="font-set" @click="changeFontDir"
              >字体方向切换</el-tag
            >
          </el-form-item>
          <el-form-item label="字体颜色：">
            <el-color-picker
              size="small"
              v-model="textForm.fontColor"
              show-alpha
              :predefine="predefineColors"
              @change="changeFontColor"
            >
            </el-color-picker>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
import rotate from "@/assets/images/rotate.png";
import defaultImg from "@/assets/images/default-book-cover.png";
//     https://s1.ax1x.com/2022/09/22/xFB7lQ.jpg
// https://s1.ax1x.com/2022/09/22/xFBHyj.jpg
// https://s1.ax1x.com/2022/09/22/xFBIfS.jpg
// https://s1.ax1x.com/2022/09/22/xFB4Ff.jpg
// https://s1.ax1x.com/2022/09/22/xFB5Y8.jpg
// https://s1.ax1x.com/2022/09/22/xFBTSg.jpg
// https://s1.ax1x.com/2022/09/22/xFBbOs.jpg
// https://s1.ax1x.com/2022/09/22/xFBLmn.jpg
import { fontFamilies, fontSizes, fontColor } from "@/utils/fontData";
import { tpls } from "@/utils/tpl";
import { fabric } from "../../../node_modules/fabric/dist/fabric.js";
// fabric
import CProgress from "@/components/c-progress.vue";
let editorCanvas = "";
export default {
  name: "EditorImg",
  data() {
    return {
      typeList: {
        tpl: {
          name: "模板",
          list: [
            {
              name: "古风",
              tpls: {
                ...tpls,
              },
            },
            {
              name: "恐怖",
              tpls: {
                horror1: {
                  background: "rgba(255,255,255,1)",
                  objects: [],
                  tplImgs:
                    "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg",
                },
                horror2: {
                  background: "rgba(255,255,255,1)",
                  objects: [],
                  tplImgs:
                    "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg",
                },
                horror3: {
                  background: "rgba(255,255,255,1)",
                  objects: [],
                  tplImgs:
                    "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg",
                },
                horror4: {
                  background: "rgba(255,255,255,1)",
                  objects: [],
                  tplImgs:
                    "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg",
                },
              },
            },
          ],
        },
        itext: {
          name: "文字",
        },
        material: {
          name: "素材",
        },
        filter: {
          name: "滤镜",
        },
      },
      activeType: "tpl",
      fontFamilies,
      fontSizes,
      fontColor,
      textForm: {
        fontFamilies: "'Microsoft Yahei', cursive",
        fontSizes: 40,
        fontColor: "rgba(255, 69, 0, 1)",
        fontDir: "horizontal",
        undeline: false,
        bold: false,
        alignItem: "center",
        letterSpace: 6,
        lineHeight: 1.5,
      },
      predefineColors: [
        "#ff4500",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585",
        "rgba(255, 69, 0, 0.68)",
        "rgb(255, 120, 0)",
        "hsv(51, 100, 98)",
        "hsva(120, 40, 94, 0.5)",
        "hsl(181, 100%, 37%)",
        "hsla(209, 100%, 56%, 0.73)",
        "#c7158577",
      ],
      showSaveBtn: true,
      testCanvas: null,
      deleteImg: null,
      rotateImg: null,
      // 添加文本框的默认属性
      textStyleData: {
        type: "editText",
        top: 50,
        left: 50,
        width: 100,
        opacity: 1,
        textAlign: "left",
        lineHeight: 1,
        charSpacing: 1,
        fontFamily: "hyzktjjkt",
        fontSize: 40,
        fontWeight: "normal",
        fontStyle: "normal",
        textBackgroundColor: "rgba(0,0,0,0)",
        // splitByGrapheme: true, // 拆分中文，可以实现自动换行
        // hasControls: true
      },
      zoomCounter: 100, // 画布缩放的尺寸
      picDetail: {
        // 图片信息
        width: 600,
        height: 800,
      },
      // 当前选中的模板名称
      activeTpl: "",
      //   缩放比例
      ratioList: [
        { label: "400%", value: "400" },
        { label: "300%", value: "300" },
        { label: "200%", value: "200" },
        { label: "175%", value: "175" },
        { label: "150%", value: "150" },
        { label: "125%", value: "125" },
        { label: "100%", value: "100" },
        { label: "75%", value: "75" },
        { label: "50%", value: "50" },
        { label: "25%", value: "25" },
        { label: "15%", value: "15" },
        { label: "实际大小", value: "actual" },
        { label: "适应屏幕", value: "auto" },
      ],
    };
  },
  components: {
    CProgress,
  },
  mounted() {
    this.init_default_tpl();

    this.init_control_style();

    this.keycode_zoom();

    var canvas = new fabric.Canvas("c");
    this.testCanvas = canvas;
  },
  methods: {
    //   初始化默认模板
    init_default_tpl() {
      const imgdefault = new Image();
      imgdefault.src = defaultImg;
      imgdefault.onload = () => {
        fabric.Image.fromURL(defaultImg, (img) => {
          const scale = 600 / imgdefault.width;
          editorCanvas = new fabric.Canvas("editorCanvas", {
            width: imgdefault.width * scale,
            height: 800,
          });
        //   editorCanvas.hoverCursor = "defalut"; //悬浮光标改成手型
          img.scale(scale);
          img.set("selectable", false); // 背景图不可选择
          const imgInstance = editorCanvas.add(img); // 添加背景图
          imgInstance.renderAll();
        });
      };
    },
    // 初始化控制器样式
    init_control_style() {
      var deleteIcon =
        "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

      var deleteImg = document.createElement("img");
      deleteImg.src = deleteIcon;
      this.deleteImg = deleteImg;

      var rotateImg = document.createElement("img");
      rotateImg.src = rotate;
      this.rotateImg = rotateImg;

      fabric.Object.prototype.transparentCorners = false;
      fabric.Object.prototype.cornerColor = "#fff";
      fabric.Object.prototype.cornerStyle = "circle";
      fabric.Object.prototype.controls.mtr.withConnection = false;
      fabric.Object.prototype.cornerSize = 10;
      // 单独修改旋转控制点距离主体的纵向距离为-20px
      fabric.Object.prototype.controls.mtr.offsetY = -20;
      fabric.Object.prototype.setControlsVisibility({
        mb: false, // 下中
        mt: false, // 上中
      });
      // 旋转按钮图标修改
      fabric.Object.prototype.controls.mtr =
        fabric.Textbox.prototype.controls.mtr = new fabric.Control({
          x: 0,
          y: -0.5,
          offsetY: -20,
          cursorStyle: "pointer",
          actionHandler: fabric.controlsUtils.rotationWithSnapping,
          cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
          // 渲染图标
          render: (...args) => this.renderIcon(...args, rotateImg, 0),
          // 设置控制点大小
          cornerSize: 30,
        });
      // 修改删除按钮图标
      fabric.Object.prototype.controls.deleteControl =
        fabric.Textbox.prototype.controls.deleteControl = new fabric.Control({
          x: 0.5,
          y: -0.5,
          offsetY: -20,
          cursorStyle: "pointer",
          mouseUpHandler: this.deleteObject,
          render: (...args) => this.renderIcon(...args, deleteImg),
          cornerSize: 24,
          withConnection: false,
        });
    },
    // 修改类型
    change_type(key) {
      this.activeType = key;
    },
    // 修改字体
    changeFontFamily(value) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set("fontFamily", value);
        editorCanvas.renderAll();
      }
    },
    // 修改字号
    changeFontSize(value) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set({
          fontSize: value,
        });
        editorCanvas.renderAll();
      }
    },
    // 修改字体粗细
    change_bold() {
      let { bold } = this.textForm;
      const obj = editorCanvas.getActiveObject();
      console.log(obj, "change_bold");
      if (obj) {
        if (!bold) {
          this.textForm.bold = true;
          obj.set("fontWeight", "bold");
        } else {
          obj.set("fontWeight", "normal");
          this.textForm.bold = false;
        }
        editorCanvas.renderAll();
      }
    },
    // 修改字体对齐方式
    change_alignItem(type) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set("textAlign", type);
        editorCanvas.renderAll();
      }
    },
    // 修改字间距 TODO 截流
    change_letterSpace(per) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set("charSpacing", per);
        editorCanvas.renderAll();
      }
    },
    // 修改行间距 TODO 截流
    change_lineHeight(per) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set("lineHeight", per);
        editorCanvas.renderAll();
      }
      console.log(obj, "change_lineHeight");
    },
    // 修改字体颜色
    changeFontColor(value) {
      const obj = editorCanvas.getActiveObject();
      if (obj) {
        obj.set("fill", value);
        editorCanvas.renderAll();
      }
    },
    // 下划线
    change_undeline() {
      let { undeline } = this.textForm;
      const obj = editorCanvas.getActiveObject();
      console.log(obj, "change_undeline");
      if (obj) {
        if (!undeline) {
          this.textForm.undeline = true;
          obj.set("underline", true);
        } else {
          obj.set("underline", false);
          this.textForm.undeline = false;
        }
        editorCanvas.renderAll();
      }
    },
    // 字体方向切换 TODO方式要改
    changeFontDir() {
      let { fontDir } = this.textForm;
      const obj = editorCanvas.getActiveObject();
      console.log(obj, "obj");
      if (obj) {
        if (fontDir == "horizontal") {
          obj.set(
            "text",
            obj.text
              .replace(/<\/?.+?>/g, "")
              .split("")
              .join("\n")
          );
          obj.set("width", obj?.dynamicMinWidth);
          this.textForm.fontDir = "vertical";
        } else {
          obj.set("text", obj.text.replace(/\r|\n/gi, ""));
          this.textForm.fontDir = "horizontal";
        }
        editorCanvas.renderAll();
      }
    },
    // 生成模板
    generate_tpl(item, tplName) {
      editorCanvas.clear();
      this.renderJson(item);
      this.activeTpl = tplName;
    },
    renderJson(item) {
      this.onMouseDown(editorCanvas); // 绑定点击新增文字事件
      console.log(item, "生成模板");
      const imgInstance = editorCanvas.loadFromJSON(item);
      console.log(imgInstance, "imgInstance");
      this.picDetail.width = imgInstance.width;
      this.picDetail.height = imgInstance.height;
      imgInstance.renderAll();
      this.showSaveBtn = false;
    },
    // 删除对象
    deleteObject(eventData, transform) {
      const target = transform.target;
      const canvas = target.canvas;
      canvas.remove(target);
      canvas.requestRenderAll();
    },
    // 加载icon
    renderIcon(ctx, left, top, styleOverride, fabricObject, img, initialAngle = 0) {
      const size = 24;
      ctx.save();
      ctx.translate(left, top);
      ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle + initialAngle));
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
      ctx.restore();
    },
    /**
     * 点击事件：
     * 1.画布上无选中元素，点击空白处添加文字
     * 2.画布上有选中元素，点击空白处，选中元素失去焦点
     * 3.画布上有选中元素，点击选中元素，进行文字编辑
     */
    onMouseDown(canvas) {
      canvas.on("mouse:down", (opt) => {
        console.log("mouse:down");
        const obj = editorCanvas.getActiveObject();
      });
    },
    // 添加文字
    add_text() {
      // let textBox = new fabric.IText('双击编辑文字', this.textStyleData);
      let textBox = new fabric.Textbox("双击编辑文字", this.textStyleData);
      setTimeout(() => {
        editorCanvas.add(textBox).setActiveObject(textBox);
      });

      // console.log(fabric.Object.prototype.controls);
    },
    // 清空画布
    resetCanvas() {
      // 获得画布上的所有对象
      let children = editorCanvas.getObjects();
      if (children.length > 0) {
        editorCanvas.remove(...children);
      }
      editorCanvas.setBackgroundColor("#fff");
    },
    // 修改画布整体的缩放比
    change_size(value) {
      let zoom = editorCanvas.getZoom(); // 获取画布当前缩放级别
      if (value == "actual" || value == "auto") {
        zoom = 1;
      } else {
        zoom = value / 100;
      }

      editorCanvas.setZoom(zoom); // 设置画布缩放级别
      editorCanvas.setWidth(600 * zoom);
      editorCanvas.setHeight(800 * zoom);
    },
    // 缩放画布
    zoomIt(type) {
      let zoom = editorCanvas.getZoom(); // 获取画布当前缩放级别
      let _zoom = 1;
      if (type == "small") {
        _zoom = Math.round((zoom - 0.1) * 100) / 100;
        if (_zoom <= 0.1) {
          this.$message("不能在缩小了");
          return;
        }
      } else {
        _zoom = Math.round((zoom + 0.1) * 100) / 100;
        if (_zoom >= 1.75) {
          this.$message("不能在放大了");
          return;
        }
      }
      this.zoomCounter = Math.round(_zoom * 100);
      editorCanvas.setZoom(_zoom); // 设置画布缩放级别
      editorCanvas.setWidth(600 * _zoom);
      editorCanvas.setHeight(800 * _zoom);
    },
    // 查看更多 TODO这里用来测试
    look_more() {
      var rect = new fabric.Rect({
        left: 100,
        top: 50,
        fill: "yellow",
        width: 200,
        height: 100,
        objectCaching: false,
        stroke: "lightgreen",
        strokeWidth: 0,
      });

      this.testCanvas.add(rect);
      this.testCanvas.setActiveObject(rect);
    },
    // 存模板
    handleSaveTpl() {
      const json = editorCanvas.toDatalessJSON();
      const toJSON = editorCanvas.toJSON();
      const toObject = editorCanvas.toObject();
      console.log(json, "json");
      console.log(toJSON, "toJSON");
      console.log(toObject, "toObject");
    },
    // 移除模板
    handle_remove_tpl() {
      // editorCanvas.clear();
      this.resetCanvas();
      this.init_default_tpl();
    },
    // 键盘缩放
    keycode_zoom() {
      document.onkeydown = (event) => {
        if (
          (event.ctrlKey === true || event.metaKey === true) &&
          (event.keyCode === 187 || event.keyCode === 189)
        ) {
          event.preventDefault();
          if (event.keyCode === 187) {
            this.zoomIt("big");
          } else if (event.keyCode === 189) {
            this.zoomIt("small");
          }
        }
      };
    },
    /**
 * 控制选中对象围绕中心点旋转
 * @param {Number} angle 
 * @returns 
 */
// rotate(angle) {
//     if (!this.canvas.getActiveObject()) return;
//     let activeObject = this.canvas.getActiveObject();
//     activeObject.rotate(angle);
//     this.canvas.requestRenderAll();
// }

  },
  destroyed() {
    // 取消监听键盘
    document.onkeydown = null;
  },
};
</script>
<style lang="scss" scoped>
.editor-img {
  height: 100vh;
  display: flex;
  &-sider {
    display: flex;
    height: 100vh;
    color: #fff;
    .type {
      width: 100px;
      background: #000;
      ul > li {
        text-align: center;
        height: 60px;
        line-height: 60px;
        color: #fff;
        cursor: pointer;
        &.active {
          background: #3a3939;
        }
      }
    }
    .type-detail {
      width: 350px;
      background: #3a3939;
      color: #fff;
      padding: 10px 10px 0;
      position: relative;
      .tpls-box {
        .title {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
          .more {
            cursor: pointer;
          }
        }
        .tpls {
          display: flex;
          flex-wrap: wrap;
          li {
            width: 80px;
            margin-right: 8px;
            font-size: 0;
            &.active {
              border: 2px solid sandybrown;
            }
            &:nth-child(4) {
              margin-right: 0;
            }
            img {
              width: 100%;
            }
          }
        }
      }
      .botton-btn {
        position: absolute;
        bottom: 20px;
        &-remove {
        }
      }
    }
  }
  &-body {
    width: calc(100vw - 450px);
    background: rgba(103, 104, 109, 0.92);
    position: relative;
    .save_btn {
      margin: 0 auto;
    }
    .l-navigator {
      position: absolute;
      right: 100px;
      bottom: 16px;
      display: flex;
      width: 100px;
      height: 30px;
      line-height: 30px;
      padding: 5px 8px;
      color: #fff;
      background-color: rgba(0, 0, 0, 0.3);
      border-radius: 14px;
      -webkit-user-select: none;
      user-select: none;
      align-items: center;
      justify-content: center;
    }
  }
  .right-box {
    width: 350px;
    background: #3a3939;
    color: #fff;
    padding: 10px 10px 0;
    .pic-detail {
    }
    .text-edit {
      .top {
        text-align: center;
        margin-bottom: 10px;
      }
      .font-set {
        margin: 10px;
        cursor: pointer;
      }
    }
  }
}
</style>
<style lang="scss">
.canvas-container {
  margin: 50px auto;
}
.el-form-item__label {
  color: #fff;
}
.ratio-popover {
  padding: 0;
  border: 0;
  background-color: rgba(0, 0, 0, 0.3);
  color: #fff;
  width: 100px;
  .ratio-box {
    text-align: center;
    li {
      line-height: 24px;
      &:hover {
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.5);
      }
    }
  }
}
</style>
