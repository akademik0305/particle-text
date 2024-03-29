window.addEventListener('load', () => {

  const canvas = document.getElementById('canvas1')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })


  canvas.width = window.innerWidth
  canvas.height = window.innerHeight


  class Particle {
    constructor(effect, x, y, color) {
      this.effect = effect
      this.x = Math.random() * this.effect.canvasWidth
      this.y = 0
      this.color = color
      this.originX = x
      this.originY = y
      this.size = this.effect.gap - 2
      this.dx = 0
      this.dy = 0
      this.vx = 0
      this.vy = 0
      this.force = 0
      this.angle = 0
      this.distance = 0
      this.friction = Math.random() * 0.6 + 0.15
      this.ease = Math.random() * 0.1 + 0.005
    }
    draw() {
      this.effect.context.fillStyle = this.color
      this.effect.context.strokeStyle = this.color
      // this.effect.context.fillRect(this.x, this.y, this.size, this.size)
      this.effect.context.beginPath();
      this.effect.context.arc(this.x, this.y, this.size, 0, Math.PI * 2, false)
      this.effect.context.fill();
      // this.effect.context.stroke();
    }

    update() {
      this.dx = this.effect.mouse.x - this.x
      this.dy = this.effect.mouse.y - this.y
      this.distance = this.dx * this.dx + this.dy * this.dy
      this.force = -this.effect.mouse.radius / this.distance

      if (this.distance < this.effect.mouse.radius) {
        this.angle = Math.atan2(this.dy, this.dx)
        this.vx += this.force * Math.cos(this.angle)
        this.vy += this.force * Math.sin(this.angle)
      }


      this.x += ((this.vx *= this.friction) + (this.originX - this.x)) * this.ease
      this.y += ((this.vy *= this.friction) + (this.originY - this.y)) * this.ease

    }
  }

  class Effect {
    constructor(context, canvasWidth, canvasHeight) {
      this.context = context
      this.canvasWidth = canvasWidth
      this.canvasHeight = canvasHeight
      this.textX = canvasWidth / 2
      this.textY = canvasHeight / 2
      this.fontSize = 120
      this.lineHeight = this.fontSize * .9
      this.maxTextWidth = canvasWidth * .8
      this.textInput = document.getElementById('textInput')
      this.textInput.addEventListener('keyup', (e) => {
        if (e.key !== ' ') {
          this.context.clearRect(0, 0, canvasWidth, canvasHeight)
          this.wrapText(e.target.value)
        }
      })

      // particle text
      this.particles = []
      this.gap = 3
      this.mouse = {
        radius: 20000,
        x: 0,
        y: 0
      }

      window.addEventListener('mousemove', (e) => {
        this.mouse.x = e.x
        this.mouse.y = e.y
        // console.log(this.mouse.x ,this.mouse.y)
      })

    }


    wrapText(text) {
      // contextSettings
      const gradient = this.context.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(.3, 'red')
      gradient.addColorStop(.5, 'yellow')
      gradient.addColorStop(.7, 'red')
      this.context.fillStyle = gradient
      this.context.font = this.fontSize + 'px Bangers'
      this.context.textAlign = 'center'
      this.context.textBaseline = 'middle'
      this.context.lineWidth = 2
      this.context.strokeStyle = 'white'
      this.context.letterSpacing = '10px'

      // break multiple text
      let linesArray = []
      let words = text.split(' ')
      let line = ''
      let lineCounter = 0


      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + ' '
        if (this.context.measureText(testLine).width > this.maxTextWidth) {
          line = words[i] + ' '
          lineCounter++
        } else {
          line = testLine
        }
        linesArray[lineCounter] = line
      }

      let textHeight = this.lineHeight * lineCounter
      this.textY = this.canvasHeight / 2 - textHeight / 2

      linesArray.forEach((el, index) => {
        this.context.fillText(el, this.textX, this.textY + index * this.lineHeight)
        // this.context.strokeText(el, this.textX, this.textY + index * this.lineHeight)
      })

      this.textToParticle()
    }


    textToParticle() {
      this.particles = []
      const pixels = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight).data
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight)

      for (let y = 0; y < this.canvasHeight; y += this.gap) {
        for (let x = 0; x < this.canvasWidth; x += this.gap) {
          const index = (y * this.canvasWidth + x) * 4
          const alpha = pixels[index + 3]
          if (alpha > 0) {
            const red = pixels[index]
            const green = pixels[index + 1]
            const blue = pixels[index + 2]
            const color = `rgb(${red}, ${green}, ${blue})`
            this.particles.push(new Particle(this, x, y, color))
          }
        }
      }
    }

    render() {
      this.particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })
    }

    resize(width, height) {
      this.canvasWidth = width
      this.canvasHeight = height
      this.textX = this.canvasWidth / 2
      this.textY = this.canvasHeight / 2
      this.maxTextWidth = this.canvasWidth * .8
    }
  }

  const effect = new Effect(ctx, canvas.width, canvas.height)
  effect.wrapText(effect.textInput.value)

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    effect.render()

    requestAnimationFrame(animate)
  }

  animate()

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    effect.resize(canvas.width, canvas.height)
    effect.wrapText(effect.textInput.value)
  })
})