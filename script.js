/* VARIABLES */
const page = document.getElementById('page'),
    loading = document.getElementById('loading'),
    slider = document.querySelector('.swiper'),
    inner1 = document.getElementById('inner-1'),
    inner2 = document.getElementById('inner-2'),
    inner3 = document.getElementById('inner-3'),
    car = document.querySelector('model-viewer'),
    slideToButtons = document.querySelectorAll('[data-slide-to]'),
    customColorInput = document.getElementById('custom-color'),
    title = document.querySelectorAll('.title'),
    bgImage = document.querySelector('picture');

const innerAnimationActive = {
    duration: 1,
    delay: 0.5,
    ease: Power4.easeOut,
    autoAlpha: 1,
    yPercent: 0,
};
const innerAnimationHidden = {
    duration: 1,
    ease: Power4.easeOut,
    autoAlpha: 0,
    yPercent: -20,
};

let hasInitializedUi = false;

const BODY_MATERIAL_EXCLUDE_PATTERN = /(glass|window|windshield|tyre|tire|rim|wheel|chrome|metal|brake|disc|caliper|interior|seat|dashboard|trim|light|lamp|head|tail|mirror)/i;

const getPaintMaterials = (materials) => {
    const namedMatches = materials.filter((material) => {
        if (!material?.pbrMetallicRoughness) {
            return false;
        }

        const materialName = material.name ?? '';
        return materialName && !BODY_MATERIAL_EXCLUDE_PATTERN.test(materialName);
    });

    if (namedMatches.length > 0) {
        return namedMatches;
    }

    return materials.filter((material) => material?.pbrMetallicRoughness);
};

const setPaintColor = (paintMaterials, color) => {
    paintMaterials.forEach((material) => {
        material.pbrMetallicRoughness.setBaseColorFactor(color);
    });
};

/* VERTICAL SLIDER */
const swiper = new Swiper(slider, {
    direction: 'vertical',
    speed: 1500,
    grabCursor: true,
    touchRatio: 2,
    threshold: 1,
    preventInteractionOnTransition: true,
    mousewheel: {
        forceToAxis: true,
    },
    keyboard: {
        enabled: true,
    },
    on: {
        init: () => {
            /* SLIDER & TITLE FADE IN */
            gsap.to(slider, {
                duration: 1,
                ease: Power4.easeOut,
                autoAlpha: 1,
            });
            gsap.to(title, innerAnimationActive);

            /* TITLE INFINITE LOOP */
            title.forEach(function (e, i) {
                let rowWidth = e.getBoundingClientRect().width;
                let rowItemWidth = e.children[0].getBoundingClientRect().width;
                let offset = ((2 * rowItemWidth) / rowWidth) * 100 * -1;
                let duration = 30 * (i + 1);

                gsap.set(e, {
                    xPercent: 0
                });

                gsap.to(e, {
                    duration: duration,
                    ease: 'none',
                    xPercent: offset,
                    repeat: -1
                });
            });
        }
    },
});

const initializeUi = () => {
    if (hasInitializedUi) {
        return;
    }
    hasInitializedUi = true;

    /* FADE OUT LOADING SCREEN */
    gsap.to(loading, {
        duration: 1,
        ease: Power4.easeOut,
        autoAlpha: 0,
    });

    /* 3D CHARACTERISTICS */
    const materials = car.model?.materials ?? [];
    const paintMaterials = getPaintMaterials(materials);

    /* CHANGE CAR PAINT */
    if (paintMaterials.length > 0) {
        setPaintColor(paintMaterials, customColorInput?.value ?? '#ffd166');
    }

    /* CAR POSITION */
    const exposure1 = '1.15',
        orbit1 = '-18deg 78deg 105%',
        exposure2 = '0.7',
        orbit2 = '-142deg 82deg 138%',
        exposure3 = '1.05',
        orbit3 = '32deg 74deg 88%';
    let target1,
        target2,
        target3;

    const setCarPosition = () => {
        target1 = 'auto auto auto';
        target2 = '-1.2m 0.15m 0m';
        target3 = 'auto auto auto';
    };
    setCarPosition();

    const carPosition = (exposure, orbit, target) => ({
        duration: 1.5,
        ease: Power4.easeOut,
        attr: {
            exposure: exposure,
            'camera-orbit': orbit,
            'camera-target': target,
        }
    });

    /* ANIMATION ON LOAD */
    gsap.to(car, carPosition(exposure1, orbit1, target1));

    /* SLIDE CHANGE */
    swiper.on('slideChange', function () {
        if (swiper.activeIndex === 0) {
            gsap.to(car, carPosition(exposure1, orbit1, target1));
            bgImage.classList.remove('slide-three-theme');
            page.classList.remove('bg-zinc-900');
            page.classList.add('bg-slate-200');
        } else if (swiper.activeIndex === 1) {
            gsap.to(car, carPosition(exposure2, orbit2, target2));
            bgImage.classList.remove('slide-three-theme');
            page.classList.remove('bg-slate-200');
            page.classList.add('bg-zinc-900');
        } else if (swiper.activeIndex === 2) {
            gsap.to(car, carPosition(exposure3, orbit3, target3));
            page.classList.remove('bg-zinc-900');
            page.classList.add('bg-slate-200');
            bgImage.classList.add('slide-three-theme');
        }

        if (swiper.activeIndex === 0) {
            gsap.to(inner1, innerAnimationActive);
            gsap.to(title, innerAnimationActive);
        } else {
            gsap.to(inner1, innerAnimationHidden);
            gsap.to(title, innerAnimationHidden);
        }

        if (swiper.activeIndex === 1) {
            gsap.to(inner2, innerAnimationActive);
        } else {
            gsap.to(inner2, innerAnimationHidden);
        }

        if (swiper.activeIndex === 2) {
            gsap.to(inner3, innerAnimationActive);
            gsap.to(bgImage, {
                duration: 1,
                delay: 1,
                ease: Power4.easeOut,
                autoAlpha: 1,
                yPercent: -50,
            });
        } else {
            gsap.to(inner3, innerAnimationHidden);
            gsap.to(bgImage, {
                duration: 0.5,
                ease: Power4.easeOut,
                autoAlpha: 0,
                yPercent: 0,
            });
        }
    });

    /* WINDOW RESIZE CAR POSITION */
    swiper.on('resize', function () {
        setCarPosition();

        if (swiper.activeIndex === 0) {
            gsap.to(car, carPosition(exposure1, orbit1, target1));
        } else if (swiper.activeIndex === 1) {
            gsap.to(car, carPosition(exposure2, orbit2, target2));
        } else if (swiper.activeIndex === 2) {
            gsap.to(car, carPosition(exposure3, orbit3, target3));
        }
    });

    /* SLIDE TO */
    slideToButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            const index = e.currentTarget.dataset.slideTo;
            if (index !== undefined) {
                swiper.slideTo(Number(index));
            }
            e.preventDefault();
        });
    });

    /* PAINT */
    customColorInput?.addEventListener('input', (e) => {
        const color = e.currentTarget.value;
        if (paintMaterials.length > 0) {
            setPaintColor(paintMaterials, color);
        }
    });
};

/* ON LOAD */
if (car.loaded) {
    initializeUi();
} else {
    car.addEventListener('load', initializeUi, { once: true });
}
