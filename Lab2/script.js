const slider = document.getElementById("slider"),
  pointers = document.getElementById("pointers"),
  toggleShifting = document.getElementById("toggle-shifting"),
  sliderItems = document.getElementById("slides"),
  prev = document.getElementById("prev"),
  next = document.getElementById("next");

class Slider {
  posX1 = 0;
  posX2 = 0;
  posInitial;
  posFinal;
  threshold = 100;
  slides = sliderItems.getElementsByClassName("slide");
  slidesLength = this.slides.length;
  slideSize = sliderItems.getElementsByClassName("slide")[0].offsetWidth;
  firstSlide = this.slides[0];
  lastSlide = this.slides[this.slidesLength - 1];
  cloneFirst = this.firstSlide.cloneNode(true);
  cloneLast = this.lastSlide.cloneNode(true);
  index = 0;
  allowShift = true;

  init() {
    sliderItems.appendChild(this.cloneFirst);

    sliderItems.insertBefore(this.cloneLast, this.firstSlide);
    slider.classList.add("loaded");

    this.createPointers();

    sliderItems.onmousedown = this.dragStart;

    sliderItems.addEventListener("touchstart", this.dragStart);
    sliderItems.addEventListener("touchend", this.dragEnd);
    sliderItems.addEventListener("touchmove", this.dragAction);

    // Click events
    prev.addEventListener("click", () => {
      this.shiftSlide(-1);
    });
    next.addEventListener("click", () => {
      this.shiftSlide(1);
    });

    // Transition events
    sliderItems.addEventListener("transitionend", this.checkIndex);
  }

  createPointers() {
    [...new Array(this.slidesLength)].forEach(() => {
      let pointer = document.createElement("span");
      pointer.className = "pointer";
      pointer.onclick = () => this.shiftSlide(1);
      pointers.appendChild(pointer);
    });
  }

  dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    this.posInitial = sliderItems.offsetLeft;

    if (e.type == "touchstart") {
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX1 = e.clientX;
      document.onmouseup = this.dragEnd;
      document.onmousemove = this.dragAction;
    }
  }

  dragAction(e) {
    e = e || window.event;

    if (e.type == "touchmove") {
      this.posX2 = this.posX1 - e.touches[0].clientX;
      this.posX1 = e.touches[0].clientX;
    } else {
      this.posX2 = this.posX1 - e.clientX;
      this.posX1 = e.clientX;
    }
    sliderItems.style.left = sliderItems.offsetLeft - this.posX2 + "px";
  }

  dragEnd(e) {
    this.posFinal = sliderItems.offsetLeft;
    if (this.posFinal - this.posInitial < -this.threshold) {
      this.shiftSlide(1, "drag");
    } else if (this.posFinal - this.posInitial > this.threshold) {
      this.shiftSlide(-1, "drag");
    } else {
      sliderItems.style.left = this.posInitial + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

  shiftSlide(dir, action) {
    console.log(
      this.allowShift,
      sliderItems,
      this.posInitial,
      this.slideSize,
      this.index
    );
    sliderItems.classList.add("shifting");

    if (this.allowShift) {
      if (!action) {
        this.posInitial = sliderItems.offsetLeft;
      }

      if (dir == 1) {
        sliderItems.style.left = this.posInitial - this.slideSize + "px";
        this.index++;
      } else if (dir == -1) {
        sliderItems.style.left = this.posInitial + this.slideSize + "px";
        this.index--;
      }
    }

    this.allowShift = false;
  }

  checkIndex() {
    sliderItems.classList.remove("shifting");

    if (this.index == -1) {
      sliderItems.style.left = -(this.slidesLength * this.slideSize) + "px";
      this.index = this.slidesLength - 1;
    }

    if (this.index == this.slidesLength) {
      sliderItems.style.left = -(1 * this.slideSize) + "px";
      this.index = 0;
    }

    this.allowShift = true;
  }
}

function slide(wrapper, items, prev, next) {
  let posX1 = 0,
    posX2 = 0,
    posInitial,
    posFinal,
    threshold = 100,
    index = 0,
    allowShift = true,
    slides = items.getElementsByClassName("slide"),
    slidesLength = slides.length,
    slideSize = items.getElementsByClassName("slide")[0].offsetWidth,
    firstSlide = slides[0],
    lastSlide = slides[slidesLength - 1],
    cloneFirst = firstSlide.cloneNode(true),
    cloneLast = lastSlide.cloneNode(true),
    shiftInterval = null;

  // Clone first and last slide
  items.appendChild(cloneFirst);
  items.insertBefore(cloneLast, firstSlide);
  wrapper.classList.add("loaded");

  createPointers();

  // Mouse events
  items.onmousedown = dragStart;

  // Touch events
  items.addEventListener("touchstart", dragStart);
  items.addEventListener("touchend", dragEnd);
  items.addEventListener("touchmove", dragAction);

  // Click events
  prev.addEventListener("click", () => {
    shiftSlide(-1);
  });
  next.addEventListener("click", () => {
    shiftSlide(1);
  });

  toggleShifting.addEventListener("click", () => {
    console.log(shiftInterval);
    if (shiftInterval) {
      clearShiftInterval();
    } else {
      startShiftInterval();
    }
  });

  // Transition events
  items.addEventListener("transitionend", checkIndex);

  clickOnSlideVideo();
  // startShiftInterval();

  function clickOnSlideVideo() {
    const listener = window.addEventListener("blur", () => {
      if (document.activeElement === document.querySelector("iframe")) {
        console.log("Clicked on iframe!");
        clearShiftInterval();
      }
      window.removeEventListener("blur", listener);
    });
  }

  function createPointers() {
    [...new Array(slidesLength)].forEach((_, idx) => {
      let pointer = document.createElement("span");
      let num = idx + 1;
      pointer.className = "pointer";
      pointer.setAttribute("id", `pointer-${num}`);
      pointer.onclick = () => {
        shiftByChoice(idx);
        setPointerActive(idx);
      };
      pointers.appendChild(pointer);
    });
  }

  function setPointerActive(idx) {
    const pointers = document.getElementsByClassName("pointer");

    for (let i = 0; i < pointers.length; i++) {
      let pointer = pointers[i];

      let id = pointer.getAttribute("id").split("-")[1];

      if (pointer.classList.contains("active")) {
        pointer.classList.remove("active");
      }

      if (idx === i) {
        pointer.classList.add("active");
      }
    }
  }

  function dragStart(e) {
    e = e || window.event;
    e.preventDefault();
    posInitial = items.offsetLeft;

    if (e.type == "touchstart") {
      posX1 = e.touches[0].clientX;
    } else {
      posX1 = e.clientX;
      document.onmouseup = dragEnd;
      document.onmousemove = dragAction;
    }
  }

  function dragAction(e) {
    e = e || window.event;

    if (e.type == "touchmove") {
      posX2 = posX1 - e.touches[0].clientX;
      posX1 = e.touches[0].clientX;
    } else {
      posX2 = posX1 - e.clientX;
      posX1 = e.clientX;
    }
    items.style.left = items.offsetLeft - posX2 + "px";
  }

  function dragEnd() {
    posFinal = items.offsetLeft;
    if (posFinal - posInitial < -threshold) {
      shiftSlide(1, "drag");
    } else if (posFinal - posInitial > threshold) {
      shiftSlide(-1, "drag");
    } else {
      items.style.left = posInitial + "px";
    }

    document.onmouseup = null;
    document.onmousemove = null;
  }

  function shiftByChoice(idx) {
    items.classList.add("shifting");

    // posInitial = items.offsetLeft;
    // console.log(slideSize, items.offsetLeft);
    let movementNumber = idx + 1;

    // if (allowShift) {
    posInitial = items.offsetLeft;

    // }
    // startShiftInterval();

    // if (dir == 1) {
    //   items.style.left = posInitial - slideSize + "px";
    //   index++;
    // } else if (dir == -1) {
    //   items.style.left = posInitial + slideSize + "px";
    //   index--;
    // }

    items.style.left = -1 * slideSize * movementNumber + "px";
    index = idx;

    startShiftInterval();
  }

  function shiftSlide(dir, action) {
    items.classList.add("shifting");

    if (allowShift) {
      if (!action) {
        posInitial = items.offsetLeft;
      }
      console.log("before: " + index);

      if (dir == 1) {
        items.style.left = posInitial - slideSize + "px";
        index++;
        // index = index === slidesLength - 1 ? 0 : index + 1;
      } else if (dir == -1) {
        items.style.left = posInitial + slideSize + "px";
        index--;
      }
      console.log("after: " + index);
    }
    startShiftInterval();

    allowShift = false;
  }

  function checkIndex() {
    items.classList.remove("shifting");

    if (index == -1) {
      items.style.left = -(slidesLength * slideSize) + "px";
      index = slidesLength - 1;
    }

    if (index == slidesLength) {
      items.style.left = -(1 * slideSize) + "px";
      index = 0;
    }

    console.log("check: ", index);

    setPointerActive(index);

    allowShift = true;
  }

  function startShiftInterval() {
    clearShiftInterval();
    shiftInterval = setInterval(() => shiftSlide(1), 4000);
  }

  function clearShiftInterval() {
    clearInterval(shiftInterval);
    shiftInterval = null;
  }
}

slide(slider, sliderItems, prev, next);

// const slideShow = new Slider();
// slideShow.init();
