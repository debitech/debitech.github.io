(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a:not(.dropdown-toggle)').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 100
        }
    })

    // Initialize and Configure Scroll Reveal Animation
    window.sr = ScrollReveal();
    sr.reveal('.sr-icons', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 200);
    sr.reveal('.sr-button', {
        duration: 1000,
        delay: 200
    });
    sr.reveal('.sr-contact', {
        duration: 600,
        scale: 0.3,
        distance: '0px'
    }, 300);

    // Initialize and Configure Magnific Popup Lightbox Plugin
    $('.popup-gallery').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1] // Will preload 0 - before current, and 1 after the current image
        },
        image: {
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.'
        }
    });

})(jQuery); // End of use strict


var group;
var container, controls;
var particlesData = [];
var camera, scene, renderer;
var positions, colors;
var particles;
var pointCloud;
var particlePositions;
var linesMesh;

var maxParticleCount = 100;
var particleCount = 50;
var r = 300;
var rHalf = r / 2;

var effectController = {
    showDots: true,
    showLines: true,
    minDistance: 100,
    limitConnections: true,
    maxConnections: 200,
    particleCount: 50
};

init();
animate();



function init() {


    container = document.getElementById( 'graph' );

    //

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.z = 400;

    // controls = new THREE.OrbitControls( camera, container );

    scene = new THREE.Scene();


    group = new THREE.Group();
    scene.add( group );



    var segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array( segments * 3 );
    colors = new Float32Array( segments * 3 );

    var WpMaterial = new THREE.PointsMaterial( {
        color: 0xFFFFFF,
        size: 3,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    } );

    var pMaterial=  new THREE.PointsMaterial( {
        size: 2,
        transparent: true,
        color: 0xFFFFFF,
        blending: THREE.AdditiveBlending
    } );

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array( maxParticleCount * 3 );

    for ( var i = 0; i < maxParticleCount; i++ ) {

        var x = Math.random() * r - r / 2;
        var y = Math.random() * r - r / 2;
        var z = Math.random() * r - r / 2;

        particlePositions[ i * 3     ] = x;
        particlePositions[ i * 3 + 1 ] = y;
        particlePositions[ i * 3 + 2 ] = z;

        // add it to the geometry
        particlesData.push( {
            velocity: new THREE.Vector3( -1 + Math.random() * 2, -1 + Math.random() * 2,  -1 + Math.random() * 2 ),
            numConnections: 0
        } );

    }

    particles.setDrawRange( 0, particleCount );
    particles.addAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setDynamic( true ) );

    // create the particle system
    pointCloud = new THREE.Points( particles, pMaterial );
    group.add( pointCloud );

    var geometry = new THREE.BufferGeometry();

    geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setDynamic( true ) );
    geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setDynamic( true ) );

    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    var material = new THREE.LineBasicMaterial( {
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    linesMesh = new THREE.LineSegments( geometry, material );
    group.add( linesMesh );

    //

    renderer = new THREE.WebGLRenderer( { antialias: true , alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    container.appendChild( renderer.domElement );

    //



    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {



    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight+100 );

}

function animate() {

    var vertexpos = 0;
    var colorpos = 0;
    var numConnected = 0;

    for ( var i = 0; i < particleCount; i++ )
        particlesData[ i ].numConnections = 0;

    for ( var i = 0; i < particleCount; i++ ) {

        // get the particle
        var particleData = particlesData[i];

        particlePositions[ i * 3     ] += particleData.velocity.x;
        particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
        particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

        if ( particlePositions[ i * 3 + 1 ] < -rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
            particleData.velocity.y = -particleData.velocity.y;

        if ( particlePositions[ i * 3 ] < -rHalf || particlePositions[ i * 3 ] > rHalf )
            particleData.velocity.x = -particleData.velocity.x;

        if ( particlePositions[ i * 3 + 2 ] < -rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
            particleData.velocity.z = -particleData.velocity.z;

        if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
            continue;

        // Check collision
        for ( var j = i + 1; j < particleCount; j++ ) {

            var particleDataB = particlesData[ j ];
            if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
                continue;

            var dx = particlePositions[ i * 3     ] - particlePositions[ j * 3     ];
            var dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
            var dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
            var dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

            if ( dist < effectController.minDistance ) {

                particleData.numConnections++;
                particleDataB.numConnections++;

                var alpha = 1.0 - dist / effectController.minDistance;

                positions[ vertexpos++ ] = particlePositions[ i * 3     ];
                positions[ vertexpos++ ] = particlePositions[ i * 3 + 1 ];
                positions[ vertexpos++ ] = particlePositions[ i * 3 + 2 ];

                positions[ vertexpos++ ] = particlePositions[ j * 3     ];
                positions[ vertexpos++ ] = particlePositions[ j * 3 + 1 ];
                positions[ vertexpos++ ] = particlePositions[ j * 3 + 2 ];

                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;

                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;
                colors[ colorpos++ ] = alpha;

                numConnected++;
            }
        }
    }


    linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;

    requestAnimationFrame( animate );


    render();

}

function render() {

    var time = Date.now() * 0.001;

    group.rotation.y = time * 0.1;
    renderer.render( scene, camera );

}




var captionLength = 0;
var caption = '';


// var phrases = ["ab"];
var phrases = [
    "We are FinTech veterans",
    "We are from Berlin",
    "We are building the next thing",
    "We will disrupt the market",
    "Game on!"
];
var phrase_pos = 0;
function swap_phrase() {
    var d1 = $.Deferred();
    if(phrase_pos == phrases.length-1){


        try {
            $('header').ripples('destroy').ripples({
                resolution: 24,
                dropRadius: 20,
                perturbance: 0.14,
            });
        }
        catch(err){
            console.log(":(")

        }

    }
    $.when(d1).done(function () {
        phrase_pos %= phrases.length;
        testTypingEffect(phrases[phrase_pos]);
        phrase_pos++;
    })
    testErasingEffect(d1);


}

$(document).ready(function() {
    captionEl = $('#caption');
    setInterval ('cursorAnimation()', 600);
    try {
        $('header').ripples({
            resolution: 24,
            dropRadius: 20,
            perturbance: 0.14,
        });
    }
    catch(err){
        console.log(":(")

    }
    swap_phrase();

    setInterval('swap_phrase()',10000)



});

function testTypingEffect(val) {
    caption = val
    type();
    cursorAnimation();
    var midH = $(window).scrollTop() + Math.floor($(window).height() / 2);
    var midW =  Math.floor($(window).width() / 2);
    try {
        $('header').ripples('drop', midW, midH, 80, 0.1)
    }
    catch(err){
        console.log(":(")

    }


}

function type() {
    captionEl.html(caption.substr(0, captionLength++));
    if(captionLength < caption.length+1) {
        setTimeout('type()', 50);
    } else {
        captionLength = 0;
        caption = '';
    }
}

function testErasingEffect(deferred) {
    caption = captionEl.html();
    captionLength = caption.length;
    if (captionLength>0) {
        erase(deferred);
    }
    else {
        deferred.resolve();
    }

    cursorAnimation();
}

function erase(deferred) {
    captionEl.html(caption.substr(0, captionLength--));
    if(captionLength >= 0) {
        setTimeout(erase, 15,deferred);
    } else {
        captionLength = 0;
        caption = '';
        deferred.resolve();
    }
}

function cursorAnimation() {
    $('#cursor').animate({
        opacity: 0
    }, 'fast', 'swing').animate({
        opacity: 1
    }, 'fast', 'swing');
}