"use strict";

import {APOOL} from "../animationpool";
import {nukeEvent} from "../util";

export default class Gallery {
  constructor(owner) {
    this.owner = owner;
    this.el = document.querySelector("#gallery");
    this.imgEl = document.querySelector("#gallery_img");
    this.closeEl = document.querySelector("#gallery_close");
    this.titleEl = document.querySelector("#gallery_title");
    this.infoEl = document.querySelector("#gallery_info");
    this.prevEl = document.querySelector("#gallery_prev");
    this.nextEl = document.querySelector("#gallery_next");
    this.file = null;

    this.auxTimer = 0;
    this.startHideAux = this.startHideAux.bind(this);
    this.hideAux = this.hideAux.bind(this);
    this.showAux = this.showAux.bind(this);

    this.onimgclick = this.onimgclick.bind(this);
    this.onpress = this.onpress.bind(this);

    Object.seal(this);

    this.el.addEventListener("mousemove", this.startHideAux);
    this.el.addEventListener("click", this.onclose.bind(this), true);
    this.closeEl.addEventListener("click", this.close.bind(this), true);

    this.prevEl.addEventListener("click", this.prev.bind(this), true);
    this.nextEl.addEventListener("click", this.next.bind(this), true);
  }

  onimgclick(e) {
    this.file.open(new e.constructor(e.type, e));
    e.preventDefault();
    e.stopPropagation();
  }

  onpress(e) {
    const {key, target: {localName}} = e;
    if (key === "Escape") {
      this.close();
      return nukeEvent(e);
    }
    if (localName === "textarea" || localName === "input") {
      return true;
    }
    if (key === "ArrowLeft") {
      this.prev();
      return nukeEvent(e);
    }
    if (key === "ArrowRight") {
      this.prev();
      return nukeEvent(e);
    }
    return true;
  }

  onclose(e) {
    if (e.target !== this.el) {
      return;
    }
    this.close();
    e.preventDefault();
  }

  close() {
    document.body.removeEventListener("keydown", this.onpress, true);
    this.el.parentElement.classList.remove("gallery");
    this.imgEl.src = "";
    this.file = null;
  }

  maybeClose(file) {
    if (this.file !== file) {
      return;
    }
    this.close();
  }

  _next(iter) {
    if (!iter) {
      this.close();
      return;
    }
    for (const i of iter) {
      if (i === this.file) {
        continue;
      }
      if (this.open(i)) {
        return;
      }
    }
  }

  prev() {
    this._next(this.owner.riterfrom(this.file));
  }

  next() {
    this._next(this.owner.iterfrom(this.file));
  }

  startHideAux() {
    this.showAux();
    if (this.auxTimer) {
      clearTimeout(this.auxTimer);
    }
    this.auxTimer = setTimeout(this.hideAux, 1500);
  }

  hideAux() {
    if (this.auxTimer) {
      clearTimeout(this.auxTimer);
    }
    this.auxTimer = 0;
    this.el.classList.remove("aux");
  }

  showAux() {
    this.el.classList.add("aux");
  }

  open(file) {
    const info = file.getGalleryInfo();
    if (!info) {
      return false;
    }
    this.file = file;
    this.imgEl.src = "/static/loader.png";
    const img = this.imgEl.cloneNode();
    img.onload = () => {
      if (this.file !== file) {
        return;
      }
      this.imgEl.parentElement.replaceChild(img, this.imgEl);
      this.imgEl = img;
      this.imgEl.addEventListener("click", this.onimgclick);
    };
    img.src = info.img;
    this.titleEl.classList.add("visible");
    this.infoEl.textContent = info.infos.join(" — ");
    this.showAux();
    APOOL.schedule(null, () => {
      this.el.parentElement.classList.add("gallery");
      this.titleEl.textContent = file.name;
      this.startHideAux();
    });
    document.body.addEventListener("keydown", this.onpress, true);
    return true;
  }
}
