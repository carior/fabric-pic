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
      <div
        class="angle-box"
        :style="{ left: angleBox.left + 'px', top: angleBox.top + 'px' }"
        v-if="showAngle"
      >
        {{ angleBox.angle }}°
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
          <el-button class="add-text" type="primary" @click="add_pic"
            >添加图片</el-button
          >
        </div>
        <el-form ref="form" label-width="100px">
          <el-form-item label="字体：">
            <el-select
              v-model="textForm.fontFamilies"
              placeholder="请选择字体"
              @change="fontChange"
            >
              <el-option
                v-for="item in fontFamilies"
                :key="item.value"
                :label="item.label"
                :value="item.fontType"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="字号：">
            <el-select
              v-model="textForm.fontSize"
              placeholder="选择字号"
              @change="updateCanvas('fontSize')"
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
            <el-tag class="font-set" @click="updateCanvas('underline')"
              >下划线</el-tag
            >
            <el-tag class="font-set" @click="updateCanvas('fontWeight')"
              >加粗</el-tag
            >
            <el-tag class="font-set" @click="change_alignItem('left')">{{
              textForm.fontDir == "horizontal" ? "左对齐" : "上对齐"
            }}</el-tag>
            <el-tag class="font-set" @click="change_alignItem('center')">{{
              textForm.fontDir == "horizontal" ? "居中" : "居中对齐"
            }}</el-tag>
            <el-tag class="font-set" @click="change_alignItem('right')">{{
              textForm.fontDir == "horizontal" ? "右对齐" : "下对齐"
            }}</el-tag>
            <el-popover placement="bottom" title="" width="200" trigger="click">
              <c-progress
                class="c-progress"
                :percent="70"
                @percentChange="change_charSpacing"
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
            <!-- <el-tag class="font-set" @click="changeFontDir2"
              >字体方向切换</el-tag
            > -->
          </el-form-item>
          <el-form-item label="字体颜色：">
            <el-color-picker
              size="small"
              v-model="textForm.fill"
              show-alpha
              :predefine="predefineColors"
              @change="updateCanvas('fill')"
            >
            </el-color-picker>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
//     https://s1.ax1x.com/2022/09/22/xFB7lQ.jpg
// https://s1.ax1x.com/2022/09/22/xFBHyj.jpg
// https://s1.ax1x.com/2022/09/22/xFBIfS.jpg
// https://s1.ax1x.com/2022/09/22/xFB4Ff.jpg
// https://s1.ax1x.com/2022/09/22/xFB5Y8.jpg
// https://s1.ax1x.com/2022/09/22/xFBTSg.jpg
// https://s1.ax1x.com/2022/09/22/xFBbOs.jpg
// https://s1.ax1x.com/2022/09/22/xFBLmn.jpg
import { fontFamilies, fontSizes } from "@/utils/fontData";
import { tpls } from "@/utils/tpl";
// import VerticalTextbox from "@/utils/VerticalTextbox";
import { fabric } from "fabric";
// import { textVerticalAlign } from "@yassidev/fabric-extensions";
import CProgress from "@/components/c-progress.vue";
import { fabricObject } from "./fabricObject";
import { fabricCommon } from "./edit";
const JP_BRACKETS =
  /[ー「」『』（）〔〕［］｛｝｟｠〈〉《》【】〖〗〘〙〚〛゛゜。、・゠＝〜…•‥◦﹅﹆,，“”]/;
let editorCanvas = "";
let _fabricObject = "";
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
      activeType: "itext",
      fontFamilies,
      fontSizes,
      textForm: {
        fontFamilies: "",
        fontSize: 20,
        fill: "rgba(255, 69, 0, 1)",
        fontDir: "horizontal",
        underline: false,
        bold: false,
        alignItem: "left",
        charSpacing: 6,
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
      showSaveBtn: false,
      testCanvas: null,
      deleteImg: null,
      rotateImg: null,
      // 添加文本框的默认属性
      textStyleData: {
        type: "textbox",
        top: 50,
        left: 50,
        width: 242,
        height: 46,
        splitByGrapheme: true, // 拆分中文，可以实现自动换行
        opacity: 1,
        textAlign: "left",
        lineHeight: 1,
        charSpacing: 1,
        fontFamily: "hyzktjjkt",
        fontSize: 20,
        fontWeight: "normal",
        fontStyle: "normal",
        textBackgroundColor: "rgba(0,0,0,0)",
        // hasControls: true,
        editable: true, // 禁止文字编辑
        // verticalAlign: "middle", // 垂直中线
        originX: "right",
        verticalAlign: "top",
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
      showAngle: false,
      angleBox: {
        left: 0,
        top: 0,
        angle: 0,
      },
      font_data: [
        // {
        //   name: "字小魂扶摇手书",
        //   fontType: "zxhfyss",
        //   type: "字小魂扶摇手书",
        //   fontUrl: "",
        // },
      ],
      fontFamily: "",
      underline: false, //下划线
      fontUrl: "", //选择字体之后对应的url
    };
  },
  components: {
    CProgress,
  },
  mounted() {
    this.init_data();

    this.keycode_zoom();
    var canvas = new fabric.Canvas("c");
    this.testCanvas = canvas;
    // textVerticalAlign(fabric);
  },
  methods: {
    init_data() {
      _fabricObject = fabricObject(this);
      editorCanvas = fabricCommon(_fabricObject, this);
      const list = [];
      editorCanvas.addObject(list);
      editorCanvas.initialize();
    },
    setActiveObjectCallback(obj) {
      this.textForm = {};
      this.textForm = obj;
      this.setAvtiveObject(obj);
    },
    // 修改类型
    change_type(key) {
      this.activeType = key;
    },
    //元素属性修改同步事件
    updateCanvas(type) {
      let num,
        obj = {};
      if (type == "text") {
        let obj = { cssName: "text", cssValue: "请输入文字" };
        editorCanvas.setCss(obj);
        return;
      }
      switch (type) {
        case "fontWeight":
          num = this.textForm.fontWeight == "bold" ? "normal" : "bold";
          obj.cssName = type;
          obj.cssValue = num;
          break;
        case "fontStyle":
          num = this.textForm.fontStyle == "italic" ? "normal" : "italic";
          obj.cssName = type;
          obj.cssValue = num;
          break;
        case "underline":
          num = !this.textForm.underline;
          obj.cssName = type;
          obj.cssValue = num;
          this.underline = !this.textForm.underline;
          break;
        case "fontFamily":
          num = this.fontFamily;
          obj.cssName = "realFontFamily";
          obj.cssValue = num;
          obj.url = this.fontUrl;
          break;
        default:
          num = this.textForm[type];
          obj.cssName = type;
          obj.cssValue = num;
          break;
      }
      editorCanvas.setCss(obj);
    },
    //字体选择事件
    fontChange(fontType) {
      let obj = this.font_data.filter((res) => {
        return res.fontType == fontType;
      });
      this.fontFamily = fontType
      console.log(fontType,'fontType');
      if (obj && obj.length > 0) {
        this.fontUrl = obj[0].fontUrl;
      }
      this.updateCanvas("fontFamily");
    },
    // 修改字体的对齐方式
    change_alignItem(type) {
      this.textForm.textAlign = type;
      this.updateCanvas("textAlign");
    },
    //加载字体文件
    loadFont(list) {
      this.font_data.push(...list);
    },
    //激活元素事件--canvas选中元素,同时同步到本页面展示对应的属性值
    setAvtiveObject: function (obj) {
      this.underline = obj.underline;
      this.fontFamily = obj.realFontFamily;
    },
    // 修改字间距 TODO 截流
    change_charSpacing(per) {
      // 1 == 0.6px
      const base = 1.2;
      let { fontDir, fontSize } = this.textForm;
      if (fontDir == "horizontal") {
        const charSpacing = ((per * 0.6) / fontSize) * 1000;
        console.log(charSpacing);
        console.log(charSpacing / 1000 + "em");
        console.log((charSpacing / 1000) * 40 + "px");
        this.textForm.charSpacing = charSpacing;
        this.updateCanvas("charSpacing");
      } else {
        const lineHeight = base + per / 100;
        // obj.set("lineHeight", lineHeight);
        editorCanvas.renderAll();
      }
    },
    // 修改行间距 TODO 截流
    change_lineHeight(per) {
      const base = 1.2;
      let { fontDir } = this.textForm;
      if (fontDir == "horizontal") {
        const lineHeight = base + per / 100;
        this.textForm.lineHeight = lineHeight;
        this.updateCanvas("lineHeight");
      } else {
        // TODO 其实是修改charTop
      }
    },
    // 生成模板
    generate_tpl(item, tplName) {
      _fabricObject.clear();
      // this.renderJson(item, tplName);
      this.renderTpl(item, tplName);
      this.activeTpl = tplName;
    },
    // 生成书名模板
    renderTpl(item, tplName) {
      let newtxt = this.bookname_rule(item.bookName);
      let list = [
        {
          title: "背景1",
          bboxWidth: "600",
          bboxHeight: "800",
          top: 0,
          left: 0,
          order: "0",
          type: "image",
          realType: "image",
          bookImgUrl: item.tplImgs,
          hasControls: false,
          isCenter: false,
        },
        // {
        //   title: "logo图片",
        //   bboxWidth: "294",
        //   bboxHeight: "80",
        //   order: "1",
        //   type: "logo",
        //   bookImgUrl:
        //     "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/8346c1ab336f8e6d0d13fb205641793a_360x480.jpg",
        //   hasControls: true,
        //   isCenter: false,
        //   top: 20,
        //   left: 300,
        // },
        {
          bboxWidth: "170",
          bboxHeight: "61",
          order: "2",
          type: "bookname",
          editable: true,
          fontSize: 24,
          color: "#000000",
          text: newtxt,
          fontType: "zxhfyss",
          fontBold: "0",
          fontItalic: "0",
          hasControls: true,
          top: 400,
          left: 300,
          isCenter: false,
          fontDir: "horizontal",
        },
        {
          bboxWidth: "200",
          bboxHeight: "27",
          order: "3",
          type: "authorname",
          editable: false,
          fontSize: 20,
          color: "#000000",
          text: `${item.authorName || "示例作者"}  著`,
          fontType: "zxhfyss",
          fontBold: "0",
          fontItalic: "0",
          hasControls: false,
          isCenter: false,
          fontDir: "horizontal",
          top: 500,
          left: 300,
        },
      ];
      editorCanvas.addObject(list);
    },
    // 书名生成规则
    bookname_rule(txt) {
      let len = txt?.length;
      if (!len) {
        return "示例书名";
      }
      let obj = {
        1: { line: 1 },
        2: { line: 1 },
        3: { line: 1 },
        4: { line: 1 },
        5: { line: 1 },
        6: { line: 1 },
        7: { line: 1 },
        8: { line: 2, wrapIndex: [6] },
        9: { line: 2, wrapIndex: [7] },
        10: { line: 2, wrapIndex: [7] },
        11: { line: 2, wrapIndex: [7] },
        12: { line: 2, wrapIndex: [7] },
        13: { line: 2, wrapIndex: [7] },
        14: { line: 2, wrapIndex: [7] },
        15: { line: 3, wrapIndex: [7, 13] },
        16: { line: 3, wrapIndex: [7, 14] },
        17: { line: 3, wrapIndex: [7, 14] },
        18: { line: 3, wrapIndex: [7, 14] },
        19: { line: 3, wrapIndex: [7, 13] },
        20: { line: 3, wrapIndex: [7, 14] },
      };
      let ruleItem = obj[len];
      if (JP_BRACKETS.test(txt)) {
        console.log(JP_BRACKETS.exec(txt).index);
        if (ruleItem.wrapIndex && ruleItem.wrapIndex.length) {
          ruleItem.wrapIndex.forEach((v, i) => {
            if (JP_BRACKETS.exec(txt)?.index == v) {
              let pos = v - 1;
              txt = txt.slice(0, pos) + "\n" + txt.slice(pos);
            }
          });
        }
        return txt;
      } else {
        if (ruleItem.wrapIndex && ruleItem.wrapIndex.length) {
          ruleItem.wrapIndex.forEach((v, i) => {
            let pos = v + i;
            txt = txt.slice(0, pos) + "\n" + txt.slice(pos);
          });
        }
        return txt;
      }
    },
    // 校验文本是否为空
    check_text({ txt, type }) {
      if (!txt) {
        this.updateCanvas("text");
      }
    },

    // 渲染json数据
    // renderJson(item) {
    //   console.log(item, "生成模板");
    //   const imgInstance = editorCanvas.loadFromJSON(item);
    //   console.log(imgInstance, "imgInstance");
    //   this.picDetail.width = imgInstance.width;
    //   this.picDetail.height = imgInstance.height;
    //   imgInstance.renderAll();
    //   this.showSaveBtn = false;
    // },
    // 添加文字
    add_text() {
      const list = [
        {
          bboxWidth: "200",
          bboxHeight: "27",
          order: "2",
          type: "authorname",
          isGif: 0,
          fontSize: 20,
          color: "#000000",
          text: `双击编辑文字`,
          fontType: "zxhfyss",
          fontBold: "0",
          fontItalic: "0",
          userId: "sn88385718",
          hasControls: false,
          isCenter: false,
          fontDir: "horizontal",
          editable: true,
          top: 0,
          left: 0,
        },
      ];
      editorCanvas.addObject(list);
      // let textBox = new fabric.IText('双击编辑文字', this.textStyleData);
      // let textBox = new fabric.Textbox("双击编辑文字", this.textStyleData);
      // const textBox = new VerticalTextbox("双击编辑文字", {
      //   editable: false
      // });
      // editorCanvas.centerObject(textBox);
      //   setControlVisible 方法删除垂直缩放的操作点，禁止用户垂直缩放。
      // textBox.setControlVisible("mt", false);
      // textBox.setControlVisible("mb", false);
      // editorCanvas.add(textBox).setActiveObject(textBox);
      //   this.textStyleData.width = textBox.width;
      //   this.textStyleData.height = textBox.height;
    },
    // 添加图片
    add_pic() {
      const list = [
        {
          title: "logo图片",
          bboxWidth: "294",
          bboxHeight: "80",
          order: "1",
          type: "logo",
          bookImgUrl:
            "https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/8346c1ab336f8e6d0d13fb205641793a_360x480.jpg",
          hasControls: true,
          isCenter: false,
          top: 0,
          left: 0,
        },
      ];
      editorCanvas.addObject(list);
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
      let zoom = _fabricObject.getZoom(); // 获取画布当前缩放级别
      if (value == "actual" || value == "auto") {
        zoom = 1;
      } else {
        zoom = value / 100;
      }

      editorCanvas.handlezoomIt(zoom);
    },
    // 点击-号+号缩放画布
    zoomIt(type) {
      editorCanvas.zoomIt(type);
    },
    // 查看更多 TODO这里用来测试
    look_more() {
      var rect = new fabric.Rect({
        left: 0,
        top: 0,
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
      // const toDatalessJSON = editorCanvas.toDatalessJSON();
      const toJSON = editorCanvas.toJSon();
      // const toObject = editorCanvas.toObject();
      // console.log(toDatalessJSON, "toDatalessJSON");
      console.log(toJSON, "toJSON");
      // console.log(toObject, "toObject");
      let url = editorCanvas.getUrl();
    },
    // 移除模板
    handle_remove_tpl() {
      _fabricObject.clear();
      const list = [];
      editorCanvas.addObject(list);
      // this.resetCanvas();
      // this.init_default_tpl();
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
        // 监听删除按钮
        // let currentActive = editorCanvas.getActiveObject();
        // if (
        //   currentActive &&
        //   !currentActive.isEditing &&
        //   (event.keyCode === 46 || event.keyCode === 8)
        // ) {
        //   editorCanvas.remove(currentActive);
        //   editorCanvas.renderAll();
        // }
      };
    },
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
    overflow: auto;
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
    .angle-box {
      position: absolute;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      padding: 2px 5px;
      border-radius: 2px;
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
