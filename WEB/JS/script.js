"use strict";

let slideIndex = 1;
showSlides(slideIndex)

function plusSlides(nb){
    showSlides(slideIndex += nb);
}

function currentSlide(nb){
    showSlides(slideIndex = nb);
}

function showSlides(nb){
    let i;
    let slides = document.getElementsByClassName("carouselSlides");
    let dots = document.getElementsByClassName("dot");
    if(nb > slides.length ){slideIndex = 1};
    if(nb < 1){slideIndex = slides.length}
    for(i = 0; i < slides.length; i++){
        slides[i].style.display = "none";
    }
    for(i = 0; i< dots.length; i++){
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}