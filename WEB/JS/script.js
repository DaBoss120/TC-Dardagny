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
        event.target.querySelector('p').classList.add('showPar');
        setTimeout(() => {
            event.target.querySelector('p').classList.add('unBlur');
        }, 0);
    })
});
document.querySelectorAll('.personnes-comite').forEach(element => {
    element.addEventListener('mouseout', event => {
        if (!element.matches(':hover')) {
            setTimeout(() => {
                if (!element.matches(':hover')) {

                    event.target.querySelector('p').classList.remove('showPar');
                }
            }, 300)
            event.target.querySelector('p').classList.remove('unBlur');
        }
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

        }, 0);
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
    })
});
// Button of class 1
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

// Button of class 2
document.querySelectorAll('.button2 button').forEach(element => {
    element.addEventListener('mouseover', event => {
        event.target.querySelector('p').classList.add('textBlurButton');
        event.target.querySelector('p').classList.remove('textBlurButtonUnhover');
    }
    )
});
document.querySelectorAll('.button2 button').forEach(element => {
    element.addEventListener('mouseout', event => {
        if (!element.matches(':hover') /* && element.classList.contains('textBlurButton')*/) {
            event.target.querySelector('p').classList.remove('textBlurButton');
            event.target.querySelector('p').classList.add('textBlurButtonUnhover');
        }
    }
    )
});