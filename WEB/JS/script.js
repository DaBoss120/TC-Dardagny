"use strict";

// let slideIndex = 1;
// showSlides(slideIndex)

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('header').innerHTML = `<div class="top_header">
            <nav>
                <ul>
                    <li>
                        <a href="#">Bookmarks</a>
                    </li>
                    <li>
                        <a href="#">Login</a>
                    </li>
                </ul>
            </nav>
            <input type="text" placeholder="Search">
        </div>
        <div class="bottom_header">
            <a href="index.html"><img src="IMG/TCD_Logo.png" alt="TCD_Logo" srcset=""></a>
            <nav>
                <ul>
                    <li>
                        <a href="index.html">HOME</a>
                    </li>
                    <li class="LeClub">
                        <a href="#">LE CLUB <i class="fa fa-caret-down"></i></a>
                        <div class="subnav-content">
                            <a href="comite.html">COMITE</a>
                            <a href="coursDeTennis.html">COURS DE TENNIS</a>
                            <a href="adhesion.html">ADHESION</a>
                            <a href="paiement.html">PAIEMENT</a>
                            <a href="reglementEtStatuts.html">REGLEMENT ET STATUTS</a>
                        </div>
                    </li>
                    <li>
                        <a href="agenda.html">AGENDA</a>
                    </li>
                    <li>
                        <a href="reservation.html">RÉSERVATION</a>
                    </li>

                    <li>
                        <a href="contact.html">CONTACT</a>
                    </li>
                </ul>
            </nav>
        </div>`
<<<<<<< HEAD
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

    const buttons = document.querySelectorAll('.button1, .button2');
    const originalButtonDimensions = new Map();

    buttons.forEach(button => {
        // Store original width and height when the DOM is loaded and buttons are unscaled
        const computedStyle = getComputedStyle(button);
        originalButtonDimensions.set(button, {
            width: parseFloat(computedStyle.width),
            height: parseFloat(computedStyle.height)
=======
        document.querySelector('.LeClub').addEventListener('mouseover', event => {
            document.querySelector('.subnav-content').classList.add('show');
>>>>>>> parent of 087552f (Light buttons)
        });
        document.querySelector('.LeClub').addEventListener('mouseout', event => {
        
            setTimeout(() => {
                if (!document.querySelector('.LeClub').matches(':hover')) {
                    document.querySelector('.subnav-content').classList.remove('show')
                }
            }, 1000);
        
        });
});

// document.querySelectorAll('.personnes-comite').forEach(element => {
//     element.addEventListener('mouseover', event => {
//         event.target.querySelector('p').classList.add('showPar');
//         setTimeout(() => {
//             event.target.querySelector('p').classList.add('unBlur');
//         }, 0);
//     })
// });
// document.querySelectorAll('.personnes-comite').forEach(element => {
//     element.addEventListener('mouseout', event => {
//         if (!element.matches(':hover')) {
//             setTimeout(() => {
//                 if (!element.matches(':hover')) {

//                     event.target.querySelector('p').classList.remove('showPar');
//                 }
//             }, 300)
//             event.target.querySelector('p').classList.remove('unBlur');
//         }
//     })
// });

// document.querySelectorAll('.personnes-professeurs').forEach(element => {
//     element.addEventListener('mouseover', event => {
//         let par = event.target.querySelector('.diplomes-professeurs');

//         // let par = document.querySelector('.personnes-comite p');
//         par.classList.add('showPar');
//         event.target.querySelectorAll('p').forEach(element => {
//             element.classList.add('showPar');
//         });
//         setTimeout(() => {
//             par.classList.add('unBlur');
//             event.target.querySelectorAll('p').forEach(element => {
//                 element.classList.add('unBlur');
//             })

//         }, 0);
//     })
// });
// document.querySelectorAll('.personnes-professeurs').forEach(element => {
//     element.addEventListener('mouseout', event => {

//         let par = event.target.querySelector('.diplomes-professeurs');
//         // par.style.display = 'none';
//         if (!element.matches(':hover')) {
//             setTimeout(() => {
//                 if (!element.matches(':hover')) {
//                     par.classList.remove('showPar');
//                     event.target.querySelectorAll('p').forEach(element => {
//                         element.classList.remove('showPar');
//                     });
//                 }
//             }, 250)
//             par.classList.remove('unBlur');
//             event.target.querySelectorAll('p').forEach(element => {
//                 element.classList.remove('unBlur');
//             });

//         }
//     })
// });
// Button of class 1
// document.querySelectorAll('.button1 button').forEach(element => {
//     element.addEventListener('mouseover', event => {
//         event.target.querySelector('p').classList.add('textBlurButton');
//         event.target.querySelector('p').classList.remove('textBlurButtonUnhover');
//     }
//     )
// });
// document.querySelectorAll('.button1 button').forEach(element => {
//     element.addEventListener('mouseout', event => {
//         if (!element.matches(':hover') /* && element.classList.contains('textBlurButton')*/) {
//             event.target.querySelector('p').classList.remove('textBlurButton');
//             event.target.querySelector('p').classList.add('textBlurButtonUnhover');
//         }
//     }
//     )
// });

// // Button of class 2
// document.querySelectorAll('.button2 button').forEach(element => {
//     element.addEventListener('mouseover', event => {
//         event.target.querySelector('p').classList.add('textBlurButton');
//         event.target.querySelector('p').classList.remove('textBlurButtonUnhover');
//     }
//     )
// });
// document.querySelectorAll('.button2 button').forEach(element => {
//     element.addEventListener('mouseout', event => {
//         if (!element.matches(':hover') /* && element.classList.contains('textBlurButton')*/) {
//             event.target.querySelector('p').classList.remove('textBlurButton');
//             event.target.querySelector('p').classList.add('textBlurButtonUnhover');
//         }
//     }
//     )
// });