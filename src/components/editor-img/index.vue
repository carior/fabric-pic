<template>
    <div class="editor-img">
        <div class="editor-img-sider">
            <div class="type">
                <ul>
                    <li 
                        @click="change_type(key)" 
                        v-for="(item, key) in typeList" 
                        :key="item.name"
                        :class="[activeType==key?'active':'']"
                    >{{item.name}}</li>
                </ul>
            </div>
            <div class="type-detail">
                <!-- 模板 -->
                <div class="tpls-box" v-if="activeType == 'tpl'">
                    <div v-for="item in typeList[activeType].list">
                        <div class="title">
                            <span class="tit">{{item.name}}</span>
                            <span class="more" @click="look_more">查看更多</span>
                        </div>
                        <ul class="tpls">
                            <li v-for="img in item.tpls">
                                <img @click="generate_tpl(img)" :src="img.tplImgs" alt="">
                                <!-- <img @click="generate_tpl" src="../../assets/images/50.jpg" alt=""> -->
                            </li>
                        </ul>
                    </div>
                </div>
                <!-- 文字 -->
                <div class="tpls-box" v-if="activeType == 'itext'">
                    <div v-for="item in typeList['tpl'].list">
                        <div class="title">
                            <span class="tit">{{item.name}}</span>
                            <span class="more" @click="look_more">查看更多</span>
                        </div>
                        <ul class="tpls">
                            <li v-for="img in item.tpls">
                                <img @click="generate_tpl(img)" :src="img.tplImgs" alt="">
                                <!-- <img @click="generate_tpl" src="../../assets/images/50.jpg" alt=""> -->
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="editor-img-body">
            <div class="canvas">
                <canvas ref="canvas" id="editorCanvas"></canvas>
            </div>
            <canvas id="c" width="400" height="300" style="border:1px solid #ccc"></canvas>
            <el-button :disabled="showSaveBtn" class="save_btn" type="primary" @click="handleSaveTpl">保存封面</el-button>
            <div class="l-navigator">
                <i class="el-icon-caret-left" @click="zoomIt(0.8)"></i>
                <span> {{ zoomCounter }} % </span>
                <i class="el-icon-caret-right" @click="zoomIt(1.2)"></i>
            </div>
        </div>
        <div class="right-box">
            <div class="text-edit" v-if="activeType == 'itext'">
                <div class="top">
                    <el-button class="add-text" type="primary" @click="add_text">添加文字</el-button>
                </div>
                <el-form ref="form" label-width="100px">
                    <el-form-item label="字体：">
                        <el-select  
                            v-model="textForm.fontFamilies"
                            placeholder="请选择字体"
                            @change="changeFontFamily">
                        <el-option
                            v-for="item in fontFamilies"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="字号：" >
                        <el-select v-model="textForm.fontSizes"
                        placeholder="选择字号"
                            @change="changeFontSize">
                        <el-option
                            v-for="item in fontSizes"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label-width="0">
                        <el-tag class="font-set" @click="change_undeline">下划线</el-tag>
                        <el-tag class="font-set"  @click="change_bold">加粗</el-tag>
                        <el-tag class="font-set" @click="change_alignItem('left')">左对齐</el-tag>
                        <el-tag class="font-set" @click="change_alignItem('center')">居中</el-tag>
                        <el-tag class="font-set" @click="change_alignItem('right')">右对齐</el-tag>
                        <el-popover
                            placement="bottom"
                            title=""
                            width="200"
                            trigger="click"
                        >
                            <c-progress class="c-progress" :percent="70" @percentChange="change_letterSpace" />
                            <el-tag slot="reference" class="font-set">字间距</el-tag>
                        </el-popover>
                        <el-popover
                            placement="bottom"
                            title=""
                            width="200"
                            trigger="click"
                        >
                            <c-progress class="c-progress" :percent="70" @percentChange="change_lineHeight" />
                            <el-tag slot="reference" class="font-set">行间距</el-tag>
                        </el-popover>
                        <el-tag class="font-set" @click="changeFontDir">字体方向切换</el-tag>
                    </el-form-item>
                    <el-form-item label="字体颜色：" >
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
import rotate from '@/assets/images/rotate.png'
import defaultImg from '@/assets/images/default-book-cover.png'
//     https://s1.ax1x.com/2022/09/22/xFB7lQ.jpg
// https://s1.ax1x.com/2022/09/22/xFBHyj.jpg
// https://s1.ax1x.com/2022/09/22/xFBIfS.jpg
// https://s1.ax1x.com/2022/09/22/xFB4Ff.jpg
// https://s1.ax1x.com/2022/09/22/xFB5Y8.jpg
// https://s1.ax1x.com/2022/09/22/xFBTSg.jpg
// https://s1.ax1x.com/2022/09/22/xFBbOs.jpg
// https://s1.ax1x.com/2022/09/22/xFBLmn.jpg
    import {
      fontFamilies,
      fontSizes,
      fontColor
    } from "@/utils/fontData";
    import {
        tpls
    } from "@/utils/tpl";
    import { fabric } from "../../../node_modules/fabric/dist/fabric.js";
    // fabric
    import CProgress from '@/components/c-progress.vue'
    let editorCanvas = "";
    export default {
        name: 'EditorImg',
        data(){
            return {
                typeList: {
                    tpl: {
                        name: '模板',
                        list: [
                            {
                                name: '古风',
                                tpls: {
                                    ...tpls
                                }
                            },
                            {
                                name: '恐怖',
                                tpls: {
                                    tpl1: {
                                        background: 'rgba(255,255,255,1)',
                                        objects: [],
                                        tplImgs: 'https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg'
                                    },
                                    tpl2: {
                                        background: 'rgba(255,255,255,1)',
                                        objects: [],
                                        tplImgs: 'https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg'
                                    },
                                    tpl3: {
                                        background: 'rgba(255,255,255,1)',
                                        objects: [],
                                        tplImgs: 'https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg'
                                    },
                                    tpl4: {
                                        background: 'rgba(255,255,255,1)',
                                        objects: [],
                                        tplImgs: 'https://cdn.wtzw.com/bookimg/public/images/cover/a3c6/c1ed18f83a0de69814ac2ee0201260d4_360x480.jpg'
                                    }
                                }
                            }
                        ]
                    },
                    itext: {
                        name: '文字',
                    },
                    material: {
                        name: '素材',
                    },
                    filter: {
                        name: '滤镜',
                    }

                },
                activeType: 'itext',
                fontFamilies,
                fontSizes,
                fontColor,
                textForm: {
                    fontFamilies: "'Microsoft Yahei', cursive",
                    fontSizes: 40,
                    fontColor: 'rgba(255, 69, 0, 1)',
                    fontDir: 'horizontal',
                    undeline: false,
                    bold: false,
                    alignItem: 'center',
                    letterSpace: 6,
                    lineHeight: 1.5,
                },
                predefineColors: [
                    '#ff4500',
                    '#ff8c00',
                    '#ffd700',
                    '#90ee90',
                    '#00ced1',
                    '#1e90ff',
                    '#c71585',
                    'rgba(255, 69, 0, 0.68)',
                    'rgb(255, 120, 0)',
                    'hsv(51, 100, 98)',
                    'hsva(120, 40, 94, 0.5)',
                    'hsl(181, 100%, 37%)',
                    'hsla(209, 100%, 56%, 0.73)',
                    '#c7158577'
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
            }
        },
        components: {
            CProgress,
        },
        mounted() {
            // editorCanvas = new fabric.Canvas("editorCanvas", {
            //     width: '600',
            //     height: '800'
            // })
            const imgdefault = new Image();
            imgdefault.src = defaultImg;
            imgdefault.onload = () => {
                fabric.Image.fromURL(defaultImg, (img) => {
                const scale = 600 / imgdefault.width
                editorCanvas = new fabric.Canvas("editorCanvas", {
                    width: imgdefault.width * scale,
                    height: imgdefault.height * scale
                })
                img.scale(scale)
                img.set('selectable', false) // 背景图不可选择
                const imgInstance = editorCanvas.add(img) // 添加背景图
                imgInstance.renderAll();
                });
            }

            var canvas = new fabric.Canvas('c');
            var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

            var deleteImg = document.createElement('img');
            deleteImg.src = deleteIcon;
            this.deleteImg = deleteImg

            var rotateImg = document.createElement('img');
            rotateImg.src = rotate;
            this.rotateImg = rotateImg

            fabric.Object.prototype.transparentCorners = false;
            fabric.Object.prototype.cornerColor = '#fff';
            fabric.Object.prototype.cornerStyle = 'circle';
            fabric.Object.prototype.controls.mtr.withConnection = false;
            fabric.Object.prototype.cornerSize = 10;
            // 单独修改旋转控制点距离主体的纵向距离为-20px
            fabric.Object.prototype.controls.mtr.offsetY = -20;
            fabric.Object.prototype.setControlsVisibility({
                mb: false, // 下中
                mt: false, // 上中
            });
            // 旋转按钮图标修改
            fabric.Object.prototype.controls.ml = 
            fabric.Textbox.prototype.controls.ml = new fabric.Control({
                x: 0,
                y: -0.5,
                offsetY: -20,
                cursorStyle: 'pointer',
                actionHandler: fabric.controlsUtils.rotationWithSnapping,
                cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
                // 渲染图标
                render: (...args) => this.renderIcon(...args, rotateImg),
                // 设置控制点大小
                cornerSize: 30
            });
            // 修改删除按钮图标
            fabric.Object.prototype.controls.deleteControl = 
            fabric.Textbox.prototype.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -32,
                cursorStyle: 'pointer',
                mouseUpHandler: this.deleteObject,
                render: (...args) => this.renderIcon(...args, deleteImg),
                cornerSize: 24,
                withConnection: false
            });

            this.testCanvas = canvas
        },
        methods: {
            // 修改类型
            change_type(key) {
                this.activeType = key
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
                let {bold} = this.textForm;
                const obj = editorCanvas.getActiveObject();
                console.log(obj, 'change_bold')
                if (obj) {
                    if(!bold) {
                        this.textForm.bold = true
                        obj.set("fontWeight", 'bold');
                    } else {
                        obj.set("fontWeight", "normal");
                        this.textForm.bold = false
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
                console.log(obj, 'change_lineHeight')
            },
            // 修改字体颜色
            changeFontColor(value) {
                const obj = editorCanvas.getActiveObject();
                if (obj) {
                    obj.set('fill', value);
                    editorCanvas.renderAll();
                }
            },
            // 下划线
            change_undeline() {
                let {undeline} = this.textForm;
                const obj = editorCanvas.getActiveObject();
                console.log(obj, 'change_undeline')
                if (obj) {
                    if(!undeline) {
                        this.textForm.undeline = true
                        obj.set("underline", true);
                    } else {
                        obj.set("underline", false);
                        this.textForm.undeline = false
                    }
                    editorCanvas.renderAll();
                }
            },
            // 字体方向切换 TODO方式要改
            changeFontDir() {
                let {fontDir} = this.textForm;
                const obj = editorCanvas.getActiveObject();
                console.log(obj, 'obj')
                if (obj) {
                    if(fontDir == 'horizontal') {
                        obj.set("text", obj.text.replace(/<\/?.+?>/g,"").split('').join('\n'));
                        obj.set("width", obj?.dynamicMinWidth);
                        this.textForm.fontDir = 'vertical'
                    } else {
                        obj.set("text", obj.text.replace(/\r|\n/ig,""));
                        this.textForm.fontDir = 'horizontal'
                    }
                    editorCanvas.renderAll();
                }
            },
            // 生成模板
            generate_tpl(item) {
                editorCanvas.clear();
                this.renderJson(item)
            },
            renderJson(item) {
                this.onMouseDown(editorCanvas) // 绑定点击新增文字事件
                const imgInstance = editorCanvas.loadFromJSON(item)
                imgInstance.renderAll();
                this.showSaveBtn = false
            },
            // 删除对象
            deleteObject(eventData, transform) {
                const target = transform.target;
                const canvas = target.canvas;
                    canvas.remove(target);
                    canvas.requestRenderAll();
            },
            // 加载icon
            renderIcon(ctx, left, top, styleOverride, fabricObject, img) {
                const size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(img, -size/2, -size/2, size, size);
                ctx.restore();
            },
            /**
            * 点击事件：
            * 1.画布上无选中元素，点击空白处添加文字
            * 2.画布上有选中元素，点击空白处，选中元素失去焦点
            * 3.画布上有选中元素，点击选中元素，进行文字编辑
            */
            onMouseDown (canvas) {
                canvas.on('mouse:down', (opt) => {
                    console.log('mouse:down');
                    const obj = editorCanvas.getActiveObject();
                })
            },
            // 添加文字
            add_text () {
                // let textBox = new fabric.IText('双击编辑文字', this.textStyleData);
                let textBox = new fabric.Textbox('双击编辑文字', this.textStyleData);
                setTimeout(() => {
                    editorCanvas.add(textBox).setActiveObject(textBox);
                })
                
                // console.log(fabric.Object.prototype.controls);
            },
            // 清空画布
            resetCanvas() {
                let children = editorCanvas.getObjects();
                if (children.length > 0) {
                    editorCanvas.remove(...children);
                }
                editorCanvas.setBackgroundColor("#fff");
            },
            // 缩放画布
            zoomIt(factor) {
                let zoomCounter = this.zoomCounter;
                let cWidth = editorCanvas.width;
                let cHeight = editorCanvas.height;
        
                /* 同步缩小 */
                if (factor < 1 && zoomCounter > 0) {
                    this.zoomCounter -= 20;
                    editorCanvas.setWidth(cWidth * factor);
                    editorCanvas.setHeight(cHeight * factor);
        
                    const objects = editorCanvas.getObjects();
                    for (let i in objects) {
                    let scaleX = objects[i].scaleX;
                    let scaleY = objects[i].scaleY;
                    let left = objects[i].left;
                    let top = objects[i].top;
                    let tempScaleX = scaleX * factor;
                    let tempScaleY = scaleY * factor;
                    let tempLeft = left * factor;
                    let tempTop = top * factor;
                    objects[i].scaleX = tempScaleX;
                    objects[i].scaleY = tempScaleY;
                    objects[i].left = tempLeft;
                    objects[i].top = tempTop;
                    objects[i].setCoords();
                    let zoomPoint = new fabric.Point(
                        editorCanvas.width / 2,
                        editorCanvas.height / 2
                    );
                    editorCanvas.zoomToPoint(zoomPoint, factor);
                    editorCanvas.renderAll();
                    editorCanvas.calcOffset();
                    }
                }
        
                /* 同步放大 */
                if (factor > 1 && zoomCounter < 100) {
                    this.zoomCounter += 20;
                    editorCanvas.setWidth(cWidth * factor);
                    editorCanvas.setHeight(cHeight * factor);
                    const objects = editorCanvas.getObjects();
                    for (let i in objects) {
                    let scaleX = objects[i].scaleX;
                    let scaleY = objects[i].scaleY;
                    let left = objects[i].left;
                    let top = objects[i].top;
                    let tempScaleX = scaleX * factor;
                    let tempScaleY = scaleY * factor;
                    let tempLeft = left * factor;
                    let tempTop = top * factor;
                    objects[i].scaleX = tempScaleX;
                    objects[i].scaleY = tempScaleY;
                    objects[i].left = tempLeft;
                    objects[i].top = tempTop;
                    objects[i].setCoords();
                    }
                    let zoomPoint = new fabric.Point(
                    editorCanvas.width / 2,
                    editorCanvas.height / 2
                    );
                    editorCanvas.zoomToPoint(zoomPoint, factor);
                    editorCanvas.renderAll();
                    editorCanvas.calcOffset();
                } else {
                    return;
                }
            },
            // 查看更多 TODO这里用来测试
            look_more() {
                var rect = new fabric.Rect({
                    left: 100,
                    top: 50,
                    fill: 'yellow',
                    width: 200,
                    height: 100,
                    objectCaching: false,
                    stroke: 'lightgreen',
                    strokeWidth: 0,
                });

                this.testCanvas.add(rect);
                this.testCanvas.setActiveObject(rect);
            },
            // 存模板
            handleSaveTpl() {
                const json = editorCanvas.toDatalessJSON()
                console.log(json, 'json');
            }
        }
    }
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
                ul>li {
                    text-align: center;
                    height: 60px;
                    line-height: 60px;
                    color: #fff;
                    cursor: pointer;
                    &.active{
                        background: #3a3939;
                    }
                }
            }
            .type-detail {
                width: 350px;
                background: #3a3939;
                color: #fff;
                padding: 10px 10px 0;
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
                            margin-right: 10px;
                            &:nth-child(4){
                                margin-right: 0;
                            }
                            img {
                                width: 100%;
                            }
                        }
                    }
                }
            }
        }
        &-body {
            width: calc(100vw - 450px);
            background: rgba(103,104,109,0.92);
            .save_btn {
                margin: 0 auto;
            }
            .l-navigator {
                position: fixed;
                right: 295px;
                bottom: 16px;
                display: flex;
                width: 100px;
                height: 30px;
                line-height: 30px;
                padding: 5px 8px;
                color: #fff;
                background-color: rgba(0, 0, 0, 0.5);
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
<style>
.canvas-container {
    margin: 50px auto;
}
.el-form-item__label {
    color: #fff;
}
</style>