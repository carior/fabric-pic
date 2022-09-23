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
            <el-button v-if="showSaveBtn" class="save_btn" type="primary">保存封面</el-button>
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
                        <span class="font-set">下划线</span>
                        <span class="font-set">加粗</span>
                        <span class="font-set">左对齐</span>
                        <span class="font-set">居中</span>
                        <span class="font-set">上下对齐</span>
                    </el-form-item>
                    <el-form-item label="字体颜色：" >
                        <el-select v-model="textForm.fontColor"
                        placeholder="请选择字体颜色"
                            @change="changeFontColor"
                        >
                        <el-option
                            v-for="item in fontColor"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                        </el-select>
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
    import {
      fontFamilies,
      fontSizes,
      fontColor
    } from "@/utils/fontData";
    import {
        tpls
    } from "@/utils/tpl";
    import { fabric } from "fabric";
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
                    fontColor: 'red'
                },
                showSaveBtn: false,
                testCanvas: null,
                deleteImg: null,
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
                },
            }
        },
        mounted() {
            editorCanvas = new fabric.Canvas("editorCanvas", {
                width: "600",
                height: "800",
            })

            var canvas = new fabric.Canvas('c');
            var deleteIcon = "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";

            var img = document.createElement('img');
            img.src = deleteIcon;
            this.deleteImg = img

            fabric.Object.prototype.transparentCorners = false;
            fabric.Object.prototype.cornerColor = '#fff';
            fabric.Object.prototype.cornerStyle = 'circle';
            fabric.Object.prototype.controls.deleteControl = new fabric.Control({
                x: 0.5,
                y: -0.5,
                offsetY: -32,
                cursorStyle: 'pointer',
                mouseUpHandler: this.deleteObject,
                render: this.renderIcon,
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
            // 修改字体颜色
            changeFontColor() {},
            // 生成模板
            generate_tpl(item) {
                this.renderJson(item)
            },
            renderJson(item) {
                this.onMouseDown(editorCanvas) // 绑定点击新增文字事件
                const imgInstance = editorCanvas.loadFromJSON(item)
                imgInstance.renderAll();
                
            },
            // 删除对象
            deleteObject(eventData, transform) {
                const target = transform.target;
                const canvas = target.canvas;
                    canvas.remove(target);
                    canvas.requestRenderAll();
            },
            // 加载icon
            renderIcon(ctx, left, top, styleOverride, fabricObject) {
                const size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
                ctx.drawImage(this.deleteImg, -size/2, -size/2, size, size);
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
                    const obj = editorCanvas.getActiveObject();
                })
            },
            // 添加文字
            add_text () {
                let textBox = new fabric.IText('双击编辑文字', this.textStyleData);
                editorCanvas.add(textBox).setActiveObject(textBox);
                console.log(fabric.Object.prototype.controls);
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
            background: rgba(235,236,240,0.92);
            .save_btn {
                margin: 0 auto;
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