"use strict";

// let slideIndex = 1;
// showSlides(slideIndex)

document.querySelector('.LeClub').addEventListener('mouseover', event => {
    document.querySelector('.subnav-content').classList.add('show');
});
document.querySelector('.LeClub').addEventListener('mouseout', event => {

    setTimeout(() => {
        if (!document.querySelector('.LeClub').matches(':hover')) {
            document.querySelector('.subnav-content').classList.remove('show')
        }
    }, 1000);

});

document.querySelectorAll('.personnes-comite').forEach(element => {
    element.addEventListener('mouseover', event => {
        let par = event.target.querySelector('p');

        // let par = document.querySelector('.personnes-comite p');
        event.target.querySelector('p').classList.add('showPar');
        setTimeout(() => {
            event.target.querySelector('p').classList.add('unBlur');

        }, 1);

        // par.style.display = "block";
        // par.style.filter = "blur(0px)";
        // par.style.transition = "0.3s";
    })
});
document.querySelectorAll('.personnes-comite').forEach(element => {
    element.addEventListener('mouseout', event => {

        let par = event.target.querySelector('p');
        // par.style.display = 'none';
        if (!element.matches(':hover')) {
            setTimeout(() => {
                if (!element.matches(':hover')) {

                    event.target.querySelector('p').classList.remove('showPar');
                }
            }, 250)
            event.target.querySelector('p').classList.remove('unBlur');

        }
        // setTimeout(()=>{
        //     document.querySelector('.personnes-comite p').style.display = "none";
        // }, 200);
    })
});

document.querySelectorAll('.personnes-professeurs').forEach(element => {
    element.addEventListener('mouseover', event => {
        let par = event.target.querySelector('.diplomes-professeurs');

        // let par = document.querySelector('.personnes-comite p');
        par.classList.add('showPar');
        event.target.querySelectorAll('p').forEach(element => {
            element.classList.add('showPar');
        });
        setTimeout(() => {
            par.classList.add('unBlur');
            event.target.querySelectorAll('p').forEach(element => {
                element.classList.add('unBlur');
            })

        }, 1);

        // par.style.display = "block";
        // par.style.filter = "blur(0px)";
        // par.style.transition = "0.3s";
    })
});
document.querySelectorAll('.personnes-professeurs').forEach(element => {
    element.addEventListener('mouseout', event => {

        let par = event.target.querySelector('.diplomes-professeurs');
        // par.style.display = 'none';
        if (!element.matches(':hover')) {
            setTimeout(() => {
                if (!element.matches(':hover')) {
                    par.classList.remove('showPar');
                    event.target.querySelectorAll('p').forEach(element => {
                        element.classList.remove('showPar');
                    });
                }
            }, 250)
            par.classList.remove('unBlur');
            event.target.querySelectorAll('p').forEach(element => {
                element.classList.remove('unBlur');
            });

        }
        // setTimeout(()=>{
        //     document.querySelector('.personnes-comite p').style.display = "none";
        // }, 200);
    })
});

document.querySelectorAll('.button1 button').forEach(element => {
    element.addEventListener('mouseover', event => {
        event.target.querySelector('p').classList.add('textBlurButton');
        event.target.querySelector('p').classList.remove('textBlurButtonUnhover');
    }
    )
});
document.querySelectorAll('.button1 button').forEach(element => {
    element.addEventListener('mouseout', event => {
        if (!element.matches(':hover') /* && element.classList.contains('textBlurButton')*/) {
            event.target.querySelector('p').classList.remove('textBlurButton');
            event.target.querySelector('p').classList.add('textBlurButtonUnhover');
        }
    }
    )
});
// function plusSlides(nb) {
//     showSlides(slideIndex += nb);
// }

// function currentSlide(nb) {
//     showSlides(slideIndex = nb);
// }

// function showSlides(nb) {
//     let i;
//     let slides = document.getElementsByClassName("carouselSlides");
//     let dots = document.getElementsByClassName("dot");
//     if (nb > slides.length) { slideIndex = 1 };
//     if (nb < 1) { slideIndex = slides.length }
//     for (i = 0; i < slides.length; i++) {
//         slides[i].style.display = "none";
//     }
//     for (i = 0; i < dots.length; i++) {
//         dots[i].className = dots[i].className.replace(" active", "");
//     }
//     slides[slideIndex - 1].style.display = "block";
//     dots[slideIndex - 1].className += " active";
// }