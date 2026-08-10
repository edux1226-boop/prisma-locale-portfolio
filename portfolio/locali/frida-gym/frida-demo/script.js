const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");

navToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
  });
});

const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.86;

  revealElements.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < triggerBottom) {
      element.classList.add("visible");
    }
  });
};

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);