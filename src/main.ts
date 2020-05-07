import { Bus } from "./bus";
import { CPU6502 } from "./6502";
import {
  printPage,
  printRegisters,
  printInfo,
  printFlags,
  fillInHex,
} from "./6502debug";

const cpu = new CPU6502();

/*
    *=$8000
    LDX #10
    STX $0000
    LDX #3
    STX $0001
    LDY $0000
    LDA #0
    CLC
    loop
    ADC $0001
    DEY
    DNE loop
    STA $0002
    NOP
    NOP
    NOP
*/
const program = [
  //1:00:16
  0xa2, // store 0x0a to register A
  0x0a,
  0x8e, // store register A to 0x0000
  0x00,
  0x00,
  0xa2, // store 0x03 in register A
  0x03,
  0x8e, // store register A to 0x0001
  0x01,
  0x00,
  0xac, // store 0x0000 to acc
  0x00,
  0x00,
  0xa9, // load 00 into acc
  0x00,
  0x18, // clear carry
  0x6d, // add bit at 0001 to acc
  0x01,
  0x00,
  0x88,
  0xd0, // branch back
  0xfa, //
  0x8d,
  0x02,
  0x00,
  0xea,
  0xea,
  0xea,
];

cpu.loadProgram(0x8000, program);

let view = document.getElementById("view");
let viewBar = document.getElementById("viewbar");
let viewTitle = document.getElementById("viewtitle");
let currentPage = "80";

const updateTitle = () => {
  if (viewTitle != null) {
    const newTitle = fillInHex(currentPage, 2);
    viewTitle.innerHTML = `<h1><b>View on page 0x${newTitle}:</h1></b>`;
  }
};

updateTitle();

if (viewBar != null) {
  viewBar.innerHTML = `
  <button id="back10"><<</button>
  <button id="back1"><</button>
  <button id="next1">></button>
  <button id="next10">>></button>
  <button id="step">step</button>`;
}

const setFlagColor = (el: HTMLElement | null, active: boolean) => {
  if (el != null) {
    if (active) {
      el.classList.remove("red");
      el.classList.add("green");
    } else {
      el.classList.remove("green");
      el.classList.add("red");
    }
  }
};

const updateRegisters = () => {
  const a = document.getElementById("regA");
  const x = document.getElementById("regX");
  const y = document.getElementById("regY");
  if (a != null && x != null && y != null) {
    x.innerHTML = "X = 0x" + fillInHex(cpu.x.toString(16), 2);
    y.innerHTML = "Y = 0x" + fillInHex(cpu.y.toString(16), 2);
    a.innerHTML = "A = 0x" + fillInHex(cpu.a.toString(16), 2);
  }
};

updateRegisters();

const updateFlags = () => {
  const f1 = document.getElementById("cary");
  const f2 = document.getElementById("zero");
  const f3 = document.getElementById("interupts");
  const f4 = document.getElementById("decimal");
  const f5 = document.getElementById("break");
  const f6 = document.getElementById("unused");
  const f7 = document.getElementById("overflow");
  const f8 = document.getElementById("negative");
  setFlagColor(f1, cpu.GetFlag(0));
  setFlagColor(f2, cpu.GetFlag(1));
  setFlagColor(f3, cpu.GetFlag(2));
  setFlagColor(f4, cpu.GetFlag(3));
  setFlagColor(f5, cpu.GetFlag(4));
  setFlagColor(f6, cpu.GetFlag(5));
  setFlagColor(f7, cpu.GetFlag(6));
  setFlagColor(f8, cpu.GetFlag(7));
};

updateFlags();

const changePage = (delta: number) => {
  let n = parseInt(currentPage, 16) + delta;
  if (n < 0) {
    n = 0x00;
  }

  if (n > 0xff) {
    n = 0xff;
  }

  currentPage = n.toString(16);
  renderPage();
  updateTitle();
};

const renderPage = () => {
  if (view != null) {
    view.innerHTML =
      "<h2>" + printPage(cpu, parseInt(currentPage, 16)) + "</h2>";
  }
};

renderPage();

let step = document.getElementById("step");
if (step != null) {
  step.onclick = () => {
    cpu.step();
    updateFlags();
    renderPage();
    updateRegisters();
  };
}
let b1 = document.getElementById("back10");
if (b1 != null) {
  b1.onclick = () => {
    changePage(-16);
  };
}

let b2 = document.getElementById("back1");
if (b2 != null) {
  b2.onclick = () => {
    changePage(-1);
  };
}

let b3 = document.getElementById("next10");
if (b3 != null) {
  b3.onclick = () => {
    changePage(16);
  };
}

let b4 = document.getElementById("next1");
if (b4 != null) {
  b4.onclick = () => {
    changePage(1);
  };
}
