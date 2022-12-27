class Slideshow {
  _index = 0;

  constructor(el) {
    this.el = el;
    this.isStart = false;
    this.transformX = 0;
    this.track = el.querySelector(".carousel__track");
    this.slides = el.querySelectorAll(".carousel__slide");

    const hasTouchEvents = "ontouchstart" in window;
    if (hasTouchEvents) {
      this.track.addEventListener("touchstart", this.handleDown.bind(this));
      this.track.addEventListener("touchmove", this.handleMove.bind(this));
      this.track.addEventListener("touchend", this.handleUp.bind(this));
    } else {
      this.track.addEventListener("mousedown", this.handleDown.bind(this));
      this.track.addEventListener("mousemove", this.handleMove.bind(this));
      this.track.addEventListener("mouseup", this.handleUp.bind(this));
    }
  }

  get index() {
    return this._index;
  }

  set index(i) {
    let newIndex = i;
    if (newIndex >= this.slides.length - 1) {
      newIndex = this.slides.length - 1;
    }
    if (newIndex < 0) {
      newIndex = 0;
    }

    this.transformX = newIndex * -this.track.offsetWidth;
    this.track.style.transform = `translateX(${this.transformX}px`;
    this._index = newIndex;
  }

  handleDown(e) {
    this.xDown = e.touches ? e.touches[0].clientX : e.clientX;
    this.yDown = e.touches ? e.touches[0].clientY : e.clientY;
    this.isStart = true;
    this.track.classList.add("dragging");
  }

  handleMove(e) {
    if (!this.isStart) return;

    const deltaX = (e.touches ? e.touches[0].clientX : e.clientX) - this.xDown;
    const deltaY = (e.touches ? e.touches[0].clientY : e.clientY) - this.yDown;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaY > absDeltaX) {
      return false;
    }

    this.track.style.transform = `translateX(${this.transformX + deltaX}px)`;
  }

  handleUp(e) {
    if (!this.xDown || !this.yDown) {
      return;
    }
    this.isStart = false;
    const xUp = e.clientX;
    const yUp = e.clientY;

    const xDiff = this.xDown - xUp;
    const yDiff = this.yDown - yUp;

    this.track.classList.remove("dragging");

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      /* most significant */
      if (xDiff > 0) {
        this.index++;
      } else {
        this.index--;
      }
    }

    this.xDown = null;
    this.yDown = null;
  }
}

const slideshowEl = document.querySelector("[js-slideshow]");
const mySlideshow = new Slideshow(slideshowEl);
