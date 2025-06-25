"use strict";

// let slideIndex = 1;
// showSlides(slideIndex)

document.addEventListener('DOMContentLoaded', () => {
    //     <nav>
    //     <ul>
    //         <li>
    //             <a href="#">Bookmarks</a>
    //         </li>
    //         <li>
    //             <a href="#">Login</a>
    //         </li>
    //     </ul>
    // </nav>
    // <input type="text" placeholder="Search"></input>
    let hamburger = document.createElement('label');
    hamburger.classList.add('bar');
    hamburger.setAttribute('for', 'check');
    hamburger.innerHTML = ` 
    <input type="checkbox" id="check">
    <span class="top"></span>
    <span class="middle"></span>
    <span class="bottom"></span>`;
    // hamburger.addEventListener('click', toggleMenu);
    document.querySelector('header').innerHTML = `
    <div class="top_header">
        <a href="index.html"><img src="IMG/TCD_Logo_Square.png" alt="TCD_Logo_Square" class="TCD_Logo_Square"></a>
   
</label>
        </div>
        <div class="bottom_header">
            <a href="index.html"><img src="IMG/TCD_Logo.png" alt="TCD_Logo" class="TCD_Logo" srcset=""></a>
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
    document.querySelector('.top_header').appendChild(hamburger);
    document.querySelector('#check').addEventListener('change', toggleMenu);

    document.querySelector('.LeClub').addEventListener('mouseover', event => {
        if (window.innerWidth > 1100) {
            document.querySelector('.subnav-content').classList.add('show');
        }
    });
    document.querySelector('.LeClub').addEventListener('mouseout', event => {
        if (window.innerWidth > 1100) {
            setTimeout(() => {
                if (!document.querySelector('.LeClub').matches(':hover')) {
                    document.querySelector('.subnav-content').classList.remove('show')
                }
            }, 1000);
        }
    });
    // --- Mobile Subnav Click Logic ---
    document.querySelector('.LeClub > a').addEventListener('click', event => {
        // Only run on mobile view
        if (window.innerWidth <= 1100) {
            event.preventDefault(); // Prevent link from navigating
            event.currentTarget.parentElement.classList.toggle('subnav-open');
        }
    });
    const buttons = document.querySelectorAll('.button1, .button2');
    const originalButtonDimensions = new Map();

    buttons.forEach(button => {
        // Store original width and height when the DOM is loaded and buttons are unscaled
        const computedStyle = getComputedStyle(button);
        originalButtonDimensions.set(button, {
            width: parseFloat(computedStyle.width),
            height: parseFloat(computedStyle.height)
        });

        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const originalDims = originalButtonDimensions.get(button);

            let currentScaleX = 1;
            let currentScaleY = 1;

            if (originalDims && originalDims.width > 0) {
                currentScaleX = rect.width / originalDims.width;
            }
            if (originalDims && originalDims.height > 0) {
                currentScaleY = rect.height / originalDims.height;
            }
            // Your CSS uses scale(1.15), which is uniform. 
            // If scaling was ever non-uniform, you'd use currentScaleY for the y-coordinate.
            // For uniform scaling, currentScaleX and currentScaleY should be very similar (or equal).
            // We'll use currentScaleX for both as scale() is uniform.

            const xInButton = e.clientX - rect.left; // Mouse x position within the visual (scaled) button box
            const yInButton = e.clientY - rect.top;  // Mouse y position within the visual (scaled) button box

            // Convert visual/scaled coordinates back to the button's unscaled coordinate space
            // because CSS 'left' and 'top' for the pseudo-element are set in that unscaled space.
            const unscaledX = xInButton / currentScaleX;
            const unscaledY = yInButton / currentScaleX; // Using currentScaleX assuming uniform scaling from CSS `scale()`

            button.style.setProperty('--mouse-x', `${unscaledX}px`);
            button.style.setProperty('--mouse-y', `${unscaledY}px`);

            // const buttons = document.querySelectorAll('.button1 button, .button2 button');

            // buttons.forEach(button => {
            //     button.addEventListener('mousemove', (e) => {
            //         const rect = button.getBoundingClientRect();
            //         const x = e.clientX - rect.left; // Mouse x position within the button
            //         const y = e.clientY - rect.top;  // Mouse y position within the button

            //         button.style.setProperty('--mouse-x', `${x}px`);
            //         button.style.setProperty('--mouse-y', `${y}px`);
            //     });

            // Optional: Reset on mouseleave if you want the effect to fade out from the center
            // button.addEventListener('mouseleave', () => {
            //     button.style.removeProperty('--mouse-x');
            //     button.style.removeProperty('--mouse-y');
            // });
        });
    });
});

function toggleMenu() {
    // const hamburger = document.querySelector(".hamburger");
    // menu.style.display == 'block' ? menu.style.display = "none" : menu.style.display = 'block';

    const menu = document.querySelector('.bottom_header nav');
    // If the menu is currently shown, hide it with animation
    if (menu.classList.contains('show')) {
        menu.classList.remove('show');
        menu.classList.add('closing');
        // Close the subnav if it's open
        document.querySelector('.LeClub').classList.remove('subnav-open');
        // When the close animation ends, clean up
        menu.addEventListener('animationend', function handler(event) {
            if (event.target === menu) {
                if (event.animationName === 'menuBackgroundSlideUp') {
                    menu.classList.remove('closing');
                    // Wait for all animations to end
                    setTimeout(() => {
                        menu.removeEventListener('animationend', handler);
                        document.body.classList.remove('no-scroll');
                    }, 200);
                }
            }
        });

    }
    // If the menu is currently hidden, show it with animation
    else {
        menu.classList.add('show');
        menu.style.display = 'flex';

        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            document.body.classList.add('no-scroll');
        }, 200);
    }
    // if (menu.style.display === 'block') {
    //     menu.style.display = 'none';
    // } else {
    //     menu.style.display = 'block';
    // }
};

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