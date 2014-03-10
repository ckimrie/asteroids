(function(){
    var timeout,
        KEY_LEFT = 37,
        KEY_UP = 38,
        KEY_RIGHT = 39,
        KEY_DOWN = 40,
        KEY_SPACE = 32,
        fps = 24,
        interval = Number((1 / fps).toFixed(2)),
        height = window.innerHeight,
        width = window.innerWidth,
        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),
        bullets = [],
        shipEdgeMode = 'passthrough', //bounce or passthrough
        ship = {
            x : height / 2,
            y: width / 2,
            v: {
                speed: -10,
                velocityAngle: 0
            },
            drag: -10,
            angle: 0,
            size: 30,
            accelerating: false,
            enginePower: 1000,
            mass: 100,
            bulletSpeed : 50
        };


    //Start
    function init() {

        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;


        queueCycle(frame);
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
    }


    //Frame
    function frame(){
        calculateShipPosition();
        drawShip();
        drawBullets();
        queueCycle(frame);
    }

    function drawBullets(){
        var v;
        //Draw any bullets that remain in the stack
        if(bullets) {
            for(var i = 0; i < bullets.length; i++){

                //Bullet lifespan check
                if(bullets[i].life < 0) {
                    bullets.splice(i, 1);
                    continue;
                }
                bullets[i].life -= 1;

                //Draw circle representing bullet
                ctx.beginPath();
                ctx.arc(bullets[i].x, bullets[i].y, bullets[i].size, 0, 2 * Math.PI, false);
                ctx.fill();

                //Update position for next cycle
                v = {
                    x : Math.cos(bullets[i].angle) * bullets[i].speed,
                    y : Math.sin(bullets[i].angle) * bullets[i].speed
                };

                bullets[i].x += v.x * interval;
                bullets[i].y += v.y * interval;

                //Canvas edge conditions
                if(bullets[i].x < 0){
                    bullets[i].angle = Math.PI + 2 * 0 - bullets[i].angle;
                }
                if(bullets[i].x > canvas.width){
                    bullets[i].angle = Math.PI + 2 * Math.PI - bullets[i].angle;
                }
                if(bullets[i].y < 0){
                    bullets[i].angle = Math.PI + 2 * Math.PI/2 - bullets[i].angle;
                }
                if(bullets[i].y > canvas.height){
                    bullets[i].angle = Math.PI + 2 * 0.5 *Math.PI - bullets[i].angle;
                }
            }
        }
    }

    function calculateShipPosition(){
        //Distance travelled
        if(ship.accelerating) {
            accelerateForward();
        }

        var v = {
                x : Math.cos(ship.v.velocityAngle) * ship.v.speed,
                y : Math.sin(ship.v.velocityAngle) * ship.v.speed
            },
            delta = {
                x : v.x * interval,
                y : v.y * interval
            };

        ship.x += delta.x;
        ship.y += delta.y;

        if(shipEdgeMode === 'passthrough') {
            //Edge conditions
            if(ship.x < (0 - ship.size/2)) {
                ship.x = canvas.width + ship.x + (ship.size/2);
            }

            if(ship.x > (canvas.width + ship.size/2)) {
                ship.x = ship.x - canvas.width - ship.size/2;
            }

            if(ship.y > (canvas.height + ship.size/2)) {
                ship.y = ship.y - canvas.height - ship.size/2;
            }

            if(ship.y < (0 - ship.size/2)) {
                ship.y = canvas.height + ship.y + (ship.size/2);
            }
        }

        if(shipEdgeMode === 'bounce') {
            if(ship.x < 0){
                ship.v.velocityAngle = Math.PI + 2 * 0 - ship.v.velocityAngle;
            }
            if(ship.x > canvas.width){
                ship.v.velocityAngle = Math.PI + 2 * Math.PI - ship.v.velocityAngle;
            }
            if(ship.y < 0){
                ship.v.velocityAngle = Math.PI + 2 * Math.PI/2 - ship.v.velocityAngle;
            }
            if(ship.y > canvas.height){
                ship.v.velocityAngle = Math.PI + 2 * 0.5 * Math.PI - ship.v.velocityAngle;
            }
        }
    }

    function drawShip(){
        ctx.clearRect(0,0, canvas.width, canvas.height);

        //Draw the ship body
        ctx.beginPath();
        var coords1 = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -1 * ship.size / 3});
        ctx.moveTo(ship.x + coords1.x, ship.y + coords1.y);

        var coords2 = rotateGeometry(ship.angle - Math.PI/2, {x: -1 * ship.size / 2.5, y : -1 * ship.size / 2});
        ctx.lineTo(ship.x + coords2.x, ship.y + coords2.y);

        var coords3 = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : ship.size / 2});
        ctx.lineTo(ship.x + coords3.x, ship.y + coords3.y);

        var coords4 = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : ship.size / 2})
        ctx.lineTo(ship.x + coords4.x, ship.y + coords4.y);

        var coords5 = rotateGeometry(ship.angle - Math.PI/2, {x: ship.size / 2.5, y : -1 * ship.size / 2});
        ctx.lineTo(ship.x + coords5.x, ship.y + coords5.y);

        var coords6 = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -1 * ship.size / 3});
        ctx.lineTo(ship.x + coords6.x, ship.y + coords6.y);

        ctx.closePath();
        ctx.stroke();

        //Draw the cone trail if the ship is accelerating
        if(ship.accelerating) {

            ctx.beginPath();

            var coords = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -2.5 * ship.size / 5});
            ctx.moveTo(ship.x + coords.x, ship.y + coords.y);

            coords = rotateGeometry(ship.angle - Math.PI/2, {x: ship.size/5, y : -3 * ship.size / 5});
            ctx.lineTo(ship.x + coords.x, ship.y + coords.y);

            coords = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -1 * ship.size * 1.5});
            ctx.lineTo(ship.x + coords.x, ship.y + coords.y);

            coords = rotateGeometry(ship.angle - Math.PI/2, {x: -1 * ship.size/5, y : -3 * ship.size / 5});
            ctx.lineTo(ship.x + coords.x, ship.y + coords.y);

            coords = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -2.5 * ship.size / 5});
            ctx.lineTo(ship.x + coords.x, ship.y + coords.y);
            ctx.closePath();
            ctx.fill();
        }

    }

    function fireWeapon(){
            //Rotate the initial position so it comes out the tip of the ship
        var coords = rotateGeometry(ship.angle - Math.PI/2, {x: 0, y : -1 * ship.size * 1.5}),

            //Bullet velocity is a combination of ship velocity and ship orientation
            bv = {
                x : ship.bulletSpeed * Math.cos(ship.angle) + ship.v.speed * Math.cos(ship.v.velocityAngle),
                y : ship.bulletSpeed * Math.sin(ship.angle) + ship.v.speed * Math.sin(ship.v.velocityAngle)
            },
            bulletAngle = Math.atan(bv.y/bv.x),
            combinedBulletSpeed =  bv.x / Math.cos(bulletAngle);

        //Create the bullet by adding it onto the bullet stack
        bullets.push({
            x: ship.x - coords.x*0.5,
            y: ship.y - coords.y*0.5,
            size: 3,
            speed: combinedBulletSpeed,
            angle: bulletAngle,
            life: 1000
        });
    }

    function rotateGeometry(shipAngle, coordinates) {
        return {
            x: Math.cos(shipAngle) * coordinates.x - Math.sin(shipAngle) * coordinates.y,
            y: Math.sin(shipAngle) * coordinates.x + Math.cos(shipAngle) * coordinates.y
        }
    }

    /**
     * FIXME
     * @param e
     */
    function onWindowResize(e){
        height = window.innerHeight;
        width = window.innerWidth;
        canvas.height = height;
        canvas.width = width;
    }

    function onKeyUp(e){
        if(e.keyCode === KEY_UP) {
            e.preventDefault();

            ship.accelerating = false;

            return false;
        }
    }

    /**
     * Key press handler
     * @param e
     * @returns {boolean}
     */
    function onKeyDown(e){
        if(e.keyCode === KEY_SPACE) {
            e.preventDefault();
            fireWeapon();
            return false;
        }
        if(e.keyCode === KEY_LEFT) {
            e.preventDefault();
            ship.angle -= 0.2;
            return false;
        }
        if(e.keyCode === KEY_RIGHT) {
            e.preventDefault();
            ship.angle += 0.2;
            return false;
        }
        if(e.keyCode === KEY_UP) {
            e.preventDefault();
            ship.accelerating = true;
            return false;
        }
    }


    function accelerateForward(){
        var a = {
                x : Math.cos(ship.angle) * ship.enginePower / ship.mass,
                y : Math.sin(ship.angle) * ship.enginePower / ship.mass
            },
            v = {
                x : Math.cos(ship.v.velocityAngle) * ship.v.speed,
                y : Math.sin(ship.v.velocityAngle) * ship.v.speed
            };

        //New velocities
        v = {
            x : v.x + a.x * interval,
            y : v.y + a.y * interval
        };

        ship.v.velocityAngle = Math.atan(v.y / v.x);
        ship.v.speed = v.x / Math.cos(ship.v.velocityAngle);

    }


    //Queue next frame
    function queueCycle(cb){
        if(requestAnimationFrame in window){
            window.requestAnimationFrame(cb);
        } else {
            clearTimeout(timeout);
            timeout = setTimeout(cb);
        }

    }

    //Start
    init();
})();