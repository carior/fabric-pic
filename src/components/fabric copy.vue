<template>
    <div class="canvas_box">
        <el-button class="el-icon-plus btn_style" @click="imgDraw" >
            <input type="file" accept="image/*"
                style="display:none"
                id="uploadfile"
                @change="uploadFile" />
            上传图片
          </el-button>
      <div class="canvas_container">
        <div class="canvas_wrapper">
          <canvas style="box-shadow:0px 0px 5px #ccc;" v-if="width!==''" id='canvas' :width='width' :height='height'></canvas>
          <div class="img-box">
            <img :src='url' id='img' class="img" ref='img' @load='init' style=""/>
          </div>
        </div>
      </div>
      <div class="canvas_tool">
        <el-color-picker class="mt-15" v-model="color" circle @change="onChangeColor"></el-color-picker>
        <el-button class="mt-15" type="danger" icon="el-icon-close" circle @click="onDel"></el-button>
        <el-button class="mt-15" type="success" icon="el-icon-check" circle @click="save"></el-button>
      </div>
    </div>
  </template>
  
  <script>
  import { fabric } from 'fabric'
  
  export default {
    name: 'Fabric',
    props: {
      url: {
        type: String
      }
    },
    data () {
      return {
        canvas: '',
        width: '',
        height: '',
        inputText: '',
        color: '#ff0000',
        fontSize: 18,
        ctxArr: {},
        count: 0,
        activeIndex: null,
        isSelect: false,
        fileStearm: '',
        operation: 'text'
      }
    },
    mounted () {
        // this.loadImg('https://cdn.wtzw.com/bookimg/public/images/cover/5faa41ba797a9_360x480.jpg')
    },
    methods: {
        // 载入图片
      imgDraw() {
        document.getElementById("uploadfile").click();
      },
      uploadFile(e) {
        editorCanvas.isDrawingMode = false;
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.onload = (e) => {
          let data = e.target.result;
          fabric.Image.fromURL(data, (img) => {
            editorCanvas.add(img).renderAll();
          });
        };
        reader.readAsDataURL(file);
        e.target.value = "";
      },
      // 图片加载完初始化画布
      init () {
        // 获取画布宽高
        this.width = this.$refs.img.offsetWidth // 宽
        this.height = this.$refs.img.offsetHeight // 高
        this.$nextTick(() => {
          console.log(this.width, this.height, this.$refs.img.src)
          this.canvas = new fabric.Canvas('canvas') // 声明画布
          this.canvas.width = this.width // 设置画布宽
          this.canvas.height = this.height // 设置画布高
          const imgInstance = this.addOriginImage(this.canvas) // 添加背景图
          imgInstance.set('selectable', false) // 背景图不可选择
          this.onMouseDown(this.canvas) // 绑定点击新增文字事件
        })
      },
      addOriginImage (canvas) {
        const imgInstance = new fabric.Image(this.$refs.img, {// 设置图片位置和样子
          left: 0,
          top: 0,
          width: this.width,
          height: this.height,
          angle: 0 // 设置图形顺时针旋转角度
        })
        canvas.add(imgInstance) // 加入到canvas中
        return imgInstance
      },
      // 添加文字
      addText (canvas, color, pos) {
        let text = new fabric.IText('', {
          borderColor: '#ff0000', // **状态时的边框颜色
          editingBorderColor: '#ff0000', // 文本对象的边框颜色，当它处于编辑模式时
          left: pos.x,
          top: pos.y - 10,
          transparentCorners: true,
          fontSize: 14,
          fill: color || '#ff0000',
          padding: 5,
          cornerSize: 5, // Size of object's controlling corners
          cornerColor: '#ff0000',
          rotatingPointOffset: 20, // Offset for object's controlling rotating point
          lockScalingFlip: true, // 不能通过缩放为负值来翻转对象
          lockUniScaling: true // 对象非均匀缩放被锁定
        })
        text.id = this.count
        // 绑定选中事件
        text.on('selected', () => {
          this.activeIndex = text.id
          this.isSelect = true
        })
        canvas.add(text).setActiveObject(text) // 添加文字到画布上，并将文字置为**状态
        text.enterEditing() // 将文字置为编辑状态
        this.activeIndex = text.id
        this.ctxArr[this.count] = text
        this.count++
      },
      delText (canvas, ctx) {
        canvas.remove(ctx)
      },
      change_dir() {
          
      },
      // 添加箭头
      // addArrow (canvas) {
      //   const sp = {
      //     x: 0,
      //     y: 30
      //   }
      //   const ep = {
      //     x: 200,
      //     y: 30
      //   }
  
      //   const p = `M ${sp.x} ${sp.y} `
      //   let path = new fabric.Path('M 0 20 L 30 0 L 27 10 L 200 20 L 27 30 L 30 40 z')
      //   path.set({ left: 0, top: 0 })
      //   path.id = this.count
      //   // 绑定选中事件
      //   path.on('selected', () => {
      //     this.activeIndex = path.id
      //     this.isSelect = true
      //   })
      //   canvas.add(path).setActiveObject(path) // 添加文字到画布上，并将文字置为**状态
      //   this.activeIndex = path.id
      //   this.ctxArr[this.count] = path
      //   this.count++
      // },
      /**
       * 点击事件：
       * 1.画布上无选中元素，点击空白处添加文字
       * 2.画布上有选中元素，点击空白处，选中元素失去焦点
       * 3.画布上有选中元素，点击选中元素，进行文字编辑
       */
      onMouseDown (canvas) {
        canvas.on('mouse:down', (opt) => {
          console.log('this.activeIndex', this.activeIndex)
          const pos = opt.absolutePointer
          // 执行文字操作
          const isText = () => {
            if (this.activeIndex === null) {
              // 如果当前没有选中元素，点击空白处添加文字
              this.addText(canvas, this.color, pos)
            } else {
              // 获取当前**对象
              const o = canvas.getActiveObject()
              if (!o) {
                this.activeIndex = null
              };
            }
          }
          switch (this.operation) {
            case 'text': isText(); break
            default: isText()
          };
        })
      },
      onDel () {
        this.delText(this.canvas, this.ctxArr[this.activeIndex])
        delete this.ctxArr[this.activeIndex]
      },
      onChangeColor () {
        // 获取当前**对象
        const o = this.canvas.getActiveObject()
        if (o) {
          console.log('this.color', this.color)
          o.set('fill', this.color)
          this.canvas.renderAll()
        };
      },
      save () {
        // const url = this.canvas.toDataURL({
        //   format: 'jpeg',
        //   quality: 1
        // })
        const url = this.canvas.toDataURL()
        var blob = this.dataURLtoBlob(url)
        var file = this.blobToFile(blob, '截图.png')
        console.log('url', url)
        console.log(file)
        this.fileStearm = file
        // 组装a标签
        let elink = document.createElement('a')
        // 设置下载文件名
        elink.download = '截图.png'
        elink.style.display = 'none'
        elink.href = URL.createObjectURL(blob)
        document.body.appendChild(elink)
        elink.click()
        document.body.removeChild(elink)
      },
      // 将base64转换为blob
      dataURLtoBlob: function (dataurl) {
        var arr = dataurl.split(',')
        var mime = arr[0].match(/:(.*?);/)[1]
        var bstr = atob(arr[1])
        var n = bstr.length
        var u8arr = new Uint8Array(n)
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n)
        }
        return new Blob([u8arr], { type: mime })
      },
      // 将blob转换为file
      blobToFile: function (theBlob, fileName) {
        theBlob.lastModifiedDate = new Date()
        theBlob.name = fileName
        return theBlob
      }
    }
  }
  </script>
  
  <style scoped lang="scss">
  .canvas_box{
    width:100%;
    height:100%;
    .img-box {
        width: 200px;
        height: 267px;
        .img {
            // width: 200px;
            // height: 267px;
            width: 100%;
            position:absolute;
            top:0;
            left:0;
            opacity:0;
            z-index:-1;
        }
    }
    .canvas_tool{
      width:80px;
      height:100%;
      box-sizing:border-box;
      padding:20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      box-shadow: 0 0 10px #ccc;
      position:fixed;
      right:0;
      top:0;
      background:white;
    }
    .canvas_container{
        width:100%;
        height:100%;
        box-sizing: border-box;
        padding: 0px 80px 0px 0px;
      .canvas_wrapper{
        width:100%;
        height:100%;
        position:relative;
        display:flex;
        flex-direction:row;
        justify-content:center;
        align-items:center;
        overflow: scroll;
      }
    }
    .el-button+.el-button{
      margin-left: 0 !important;
    }
    .mt-15{
      margin-top:15px;
    }
  }
  </style>