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

    // --- Page Load Transition ---
    setTimeout(() => {
        document.body.classList.add('loaded');
        this.document.querySelector('main').style.opacity = '1';
    }, 10);

    // --- End of Page Load Transition Fix ---
    let hamburger = document.createElement('label');
    hamburger.classList.add('bar');
    hamburger.setAttribute('for', 'check');
    hamburger.innerHTML = ` 
    <input type="checkbox" id="check">
    <span class="top"></span>
    <span class="middle"></span>
    <span class="bottom"></span>`;
    // hamburger.addEventListener('click', toggleMenu);
    const baseUrl = window.location.origin;

    const isOnHomePage = baseUrl == this.window.location.href || baseUrl + '/' == this.window.location.href;
    document.querySelector('header').innerHTML = `
    <div class="top_header">
        <a href="/TC-Dardagny"><img src=" ${isOnHomePage ? "IMG/TCD_Logo_Square.png" : "../IMG/TCD_Logo_Square.png"}" alt="TCD_Logo_Square" class="TCD_Logo_Square"></a>
    </div>
    <div class="bottom_header">
        <a href="/TC-Dardagny"><img src="${isOnHomePage ? "IMG/TCD_Logo.png" : "../IMG/TCD_Logo.png"}" alt="TCD_Logo" class="TCD_Logo" srcset=""></a>
        <nav>
            <ul>
                <li>
                    <a href="/">HOME</a>
                </li>
                <li class="LeClub">
                    <a href="#">LE CLUB <i class="fa fa-caret-down"></i></a>
                    <div class="subnav-content">
                        <a href="/TC-Dardagny/comite/">COMITE</a>
                        <a href="/TC-Dardagny/cours de tennis/">COURS DE TENNIS</a>
                        <a href="/TC-Dardagny/adhesion/">ADHESION</a>
                        <a href="/TC-Dardagny/paiement/">PAIEMENT</a>
                        <a href="/TC-Dardagny/reglement et status/">REGLEMENT ET STATUTS</a>
                    </div>
                </li>
                <li>
                    <a href="/TC-Dardagny/agenda/">AGENDA</a>
                </li>
                <li>
                    <a href="/TC-Dardagny/reservation/">RÉSERVATION</a>
                </li>
                <li>
                    <a href="/TC-Dardagny/contact/">CONTACT</a>
                </li>
            </ul>
        </nav>
    </div>`;



    document.querySelector('.top_header').appendChild(hamburger);
    document.querySelector('#check').addEventListener('change', toggleMenu);

    document.querySelector('.LeClub').addEventListener('mouseover', event => {
        if (window.innerWidth > 768) {
            document.querySelector('.subnav-content').classList.add('show');
        }
    });
    document.querySelector('.LeClub').addEventListener('mouseout', event => {
        if (window.innerWidth > 768) {
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
        if (window.innerWidth <= 768) {
            event.preventDefault(); // Prevent link from navigating
            event.currentTarget.parentElement.classList.toggle('subnav-open');
            if (document.querySelector('.subnav-open')) {
                document.querySelector('.subnav-content').style.overflow = 'hidden';
            }
            else {
                document.querySelector('.subnav-content').style.overflow = 'visible';
                setTimeout(() => {
                    document.querySelector('.subnav-content').style.overflow = 'hidden';

                }, 500);
            }
        }
    });

    // --- Text Wave Animation on Hover ---
    if (window.innerWidth > 768) textWaveAnimation();


    // --- Button Hover Effect ---
    buttonHoverEffect();

    if (document.querySelector('.carousel')) {
        carouselDotEffect();
    }

});
function textWaveAnimation() {
    // Select all main navigation links
    const navLinks = document.querySelectorAll('.bottom_header nav > ul > li > a, .subnav-content > a');

    navLinks.forEach(link => {
        const icon = link.querySelector('i'); // Check for an icon (like the caret)
        let textContent = '';

        // Isolate the text from the icon to avoid breaking it
        const textNode = Array.from(link.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
        if (textNode) {
            textContent = textNode.textContent.trim();
            link.removeChild(textNode); // Remove the original text
        }

        // Wrap each letter in a span and add it back to the link
        const letters = textContent.split('').map((char, i) => {
            // Set an animation-delay for each letter to create the wave effect
            // Make sure to handle spaces correctly : don't wrap spaces in spans
            return char == " " ? " " : `<span style="animation-delay: ${i * 0.025}s;">${char}</span>`;
        }).join('');

        link.insertAdjacentHTML('afterbegin', letters);

        // If there was an icon, add it back at the end
        if (icon) {
            link.appendChild(document.createTextNode(' '));
            link.appendChild(icon);
        }

        link.addEventListener('mouseenter', () => {
            link.classList.add('is-hovered');
        });

        link.addEventListener('mouseleave', () => {
            const spans = link.querySelectorAll('span');
            spans.forEach(span => {
                // Capture the current computed styles at the moment of leaving
                const computedStyle = window.getComputedStyle(span);
                const matrix = new DOMMatrix(computedStyle.transform);
                const scale = matrix.a; // In a 2D scale, 'a' holds the scaleX value
                const color = computedStyle.color;

                // Set these styles directly to override the animation's end state
                span.style.transform = `scale(${scale})`;
                span.style.color = color;
                span.style.transition = 'none'; // Temporarily disable transition
            });

            // Remove the class that triggers the animation
            link.classList.remove('is-hovered');

            // Force a browser reflow to apply the inline styles immediately
            void link.offsetWidth;

            // Re-enable transitions and reset styles to smoothly animate back
            spans.forEach(span => {
                span.style.transition = 'transform 0.3s ease-out, color 0.3s ease-out';
                span.style.transform = 'scale(1)';
                span.style.color = ''; // Resets to the default CSS color
            });
        });
    });
}
function buttonHoverEffect() {
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
            // Add a fade in animation for the main content

        });
    });
}
function carouselDotEffect() {
    const dotsContainer = document.querySelector('.dots');
    const dots = document.querySelectorAll('.dot');
    const maxScale = 1.8; // The biggest a dot can get
    const effectRadius = 100; // How far the "wave" extends in pixels

    dotsContainer.addEventListener('mousemove', (e) => {
        const containerRect = dotsContainer.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;

        dots.forEach(dot => {
            const dotRect = dot.getBoundingClientRect();
            // Calculate the horizontal center of the dot relative to the container
            const dotCenterX = (dotRect.left - containerRect.left) + (dotRect.width / 2);

            // Calculate the distance between the mouse and the dot's center
            const distance = Math.abs(mouseX - dotCenterX);

            // If the mouse is outside the effect radius, the scale is 1 (normal size)
            if (distance > effectRadius) {
                dot.style.transform = 'scale(1)';
            } else {
                // Use a smooth curve to calculate the scale based on distance
                // (1 - distance / radius) creates a linear falloff. Squaring it makes the falloff curved and smoother.
                const falloff = Math.pow(1 - (distance / effectRadius), 2);
                const scale = 1 + (maxScale - 1) * falloff;
                dot.style.transform = `scale(${scale})`;
                dot.style.transform += `translateY(${(1 - scale) * 5}px)`; // Adjust vertical position based on scale
            }
        });
    });

    // Add a mouseleave event to reset the dots when the cursor leaves the container
    dotsContainer.addEventListener('mouseleave', () => {
        dots.forEach(dot => {
            // Smoothly transition back to normal size
            dot.style.transform = 'scale(1)';
        });
    });
}
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