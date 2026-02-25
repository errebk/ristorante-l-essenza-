// Intersection Observer per animazioni allo scorrimento (fade-in)
document.addEventListener('DOMContentLoaded', () => {
    
    const fadeElements = document.querySelectorAll('.fade-in');

    const fadeObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Inizia l'animazione quando il 15% dell'elemento è visibile
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Ferma l'osservatore una volta animato
            }
        });
    }, fadeObserverOptions);

    fadeElements.forEach(element => {
        fadeObserver.observe(element);
    });

    // Effetto Parallasse leggero per l'ero (Hero) sullo scroll se il dispositivo supporta hover
    const hero = document.getElementById('hero');
    
    window.addEventListener('scroll', () => {
        if(window.innerWidth > 768) {
            let scrollPosition = window.pageYOffset;
            hero.style.backgroundPositionY = (scrollPosition * 0.4) + 'px';
        }
    });

    // Calcolo tempi di percorrenza reali (tramite Geolocation API e OSRM)
    const carTimeBadge = document.getElementById('car-time');
    const walkTimeBadge = document.getElementById('walk-time');
    
    if (carTimeBadge && walkTimeBadge) {
        const carTimeText = carTimeBadge.querySelector('.time-text');
        const walkTimeText = walkTimeBadge.querySelector('.time-text');

        // Coordinate fittizie del ristorante (Milano Centro - zona Viale della Rinascita)
        const restaurantLat = 45.4700;
        const restaurantLon = 9.1900;

        const calculateTimes = () => {
            if ("geolocation" in navigator) {
                carTimeText.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                walkTimeText.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                navigator.geolocation.getCurrentPosition(async (position) => {
                    const userLat = position.coords.latitude;
                    const userLon = position.coords.longitude;

                    try {
                        // API Routing OSRM (Profilo Auto)
                        const carRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${restaurantLon},${restaurantLat}?overview=false`);
                        const carData = await carRes.json();
                        
                        if (carData.routes && carData.routes[0]) {
                            const carMins = Math.round(carData.routes[0].duration / 60);
                            carTimeText.textContent = `${carMins} min`;
                        } else {
                            carTimeText.textContent = "N/D";
                        }

                        // API Routing OSRM (Profilo Piedi)
                        const walkRes = await fetch(`https://router.project-osrm.org/route/v1/foot/${userLon},${userLat};${restaurantLon},${restaurantLat}?overview=false`);
                        const walkData = await walkRes.json();
                        
                        if (walkData.routes && walkData.routes[0]) {
                            const walkMins = Math.round(walkData.routes[0].duration / 60);
                            walkTimeText.textContent = `${walkMins} min`;
                        } else {
                            walkTimeText.textContent = "N/D";
                        }

                    } catch (error) {
                        console.error("Errore nel calcolo del percorso", error);
                        carTimeText.textContent = "Errore";
                        walkTimeText.textContent = "Errore";
                    }
                }, (error) => {
                    console.error("Geolocalizzazione negata o non disponibile", error);
                    carTimeText.textContent = "Negata";
                    walkTimeText.textContent = "Negata";
                });
            } else {
                carTimeText.textContent = "Non supp.";
                walkTimeText.textContent = "Non supp.";
            }
        };

        // Calcola al click sulle badge
        carTimeBadge.addEventListener('click', calculateTimes);
        walkTimeBadge.addEventListener('click', calculateTimes);
    }
});
