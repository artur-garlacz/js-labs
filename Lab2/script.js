const slider = document.getElementById("slider"),
  pointers = document.getElementById("pointers"),
  toggleShifting = document.getElementById("toggle-shifting"),
  sliderItems = document.getElementById("slides"),
  prev = document.getElementById("prev"),
  next = document.getElementById("next");

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
    allowIntervalShift = true,
    shiftInterval = null;

  return function init() {
    items.appendChild(cloneFirst);
    items.insertBefore(cloneLast, firstSlide);
    wrapper.classList.add("loaded");

    createPointers();

    items.onmousedown = dragStart;

    items.addEventListener("touchstart", dragStart);
    items.addEventListener("touchend", dragEnd);
    items.addEventListener("touchmove", dragAction);

    prev.addEventListener("click", () => {
      shiftSlide(-1);
    });
    next.addEventListener("click", () => {
      shiftSlide(1);
    });

    toggleShifting.onclick = () => {
      if (shiftInterval) {
        clearShiftInterval();
      } else {
        startShiftInterval();
      }
    };

    items.addEventListener("transitionend", checkIndex);

    clickOnSlideVideo();
    startShiftInterval();
  };

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
      pointer.className = "pointer";

      setPointerActive(index);

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

    let movementNumber = idx + 1;

    posInitial = items.offsetLeft;

    items.style.left = -1 * slideSize * movementNumber + "px";
    index = idx;

    startShiftInterval();

    allowShift = false;
  }

  function shiftSlide(dir, action) {
    items.classList.add("shifting");

    if (allowShift) {
      if (!action) {
        posInitial = items.offsetLeft;
      }

      if (dir == 1) {
        items.style.left = posInitial - slideSize + "px";
        index++;
      } else if (dir == -1) {
        items.style.left = posInitial + slideSize + "px";
        index--;
      }
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

    setPointerActive(index);

    allowShift = true;
  }

  function startShiftInterval() {
    if (!allowIntervalShift) return;
    clearShiftInterval();
    shiftInterval = setInterval(() => shiftSlide(1), 4000);
    toggleShifting.innerHTML = "STOP";
  }

  function clearShiftInterval() {
    clearInterval(shiftInterval);
    shiftInterval = null;
    toggleShifting.innerHTML = "START";
  }
}

slide(slider, sliderItems, prev, next)();
