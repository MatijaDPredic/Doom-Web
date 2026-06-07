const scenes = {
  outside: document.getElementById("scene-outside"),
  hallway: document.getElementById("scene-hallway"),
  doom: document.getElementById("scene-doom")
};

function showScene(name) {
  for (const scene of Object.values(scenes)) {
    scene.classList.remove("scene-active");
  }
  scenes[name].classList.add("scene-active");
}

function makeAccessibleTrigger(element, action) {
  element.addEventListener("click", action);

  element.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  });
}

makeAccessibleTrigger(document.getElementById("front-door"), () => {
  showScene("hallway");
});

makeAccessibleTrigger(document.getElementById("exit-hall"), () => {
  showScene("doom");
});

makeAccessibleTrigger(document.getElementById("exit-doom"), () => {
  showScene("hallway");
});