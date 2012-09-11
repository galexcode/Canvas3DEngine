import "./vector.jsx";
import "./matrix.jsx";
import "./quaternion.jsx";
import "./engine.jsx";
import "./list.jsx";
import "js/web.jsx";
import "timer.jsx";

class Util3D {

    static function sphere(context:Context3D, size:number, div:int) : void {
        var ver = div;
        var hor = div*2;
        var sin = Math.sin;
        var cos = Math.cos;
        var pi = Math.PI;

        context.beginGroup(new Vector(0, 0, 0));
        for (var i=0; i<hor; i++) {
            var i1 = 0;
            var i2 = 1;
            var j1 = i+1;
            var j2 = i;
            context.renderPolygonGroup([
                new Vector(cos(2*pi*j1/hor)*sin(pi*i1/ver)*size, cos(pi*i1/ver)*size, sin(2*pi*j1/hor)*sin(pi*i1/ver)*size),
                new Vector(cos(2*pi*j1/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j1/hor)*sin(pi*i2/ver)*size),
                new Vector(cos(2*pi*j2/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j2/hor)*sin(pi*i2/ver)*size)
            ], new Color(128, 128, 255));
        }
        for (var i=1; i<ver-1; i++) {
            for (var j=0; j<hor; j++) {
                var i1 = i;
                var i2 = i+1;
                var j1 = j+1;
                var j2 = j;
                context.renderPolygonGroup([
                    new Vector(cos(2*pi*j1/hor)*sin(pi*i1/ver)*size, cos(pi*i1/ver)*size, sin(2*pi*j1/hor)*sin(pi*i1/ver)*size),
                    new Vector(cos(2*pi*j1/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j1/hor)*sin(pi*i2/ver)*size),
                    new Vector(cos(2*pi*j2/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j2/hor)*sin(pi*i2/ver)*size),
                    new Vector(cos(2*pi*j2/hor)*sin(pi*i1/ver)*size, cos(pi*i1/ver)*size, sin(2*pi*j2/hor)*sin(pi*i1/ver)*size)
                ], new Color(128, 128, 255));
            }
        }
        for (var i=0; i<hor; i++) {
            var i1 = ver-1;
            var i2 = ver;
            var j1 = i+1;
            var j2 = i;
            context.renderPolygonGroup([
                new Vector(cos(2*pi*j1/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j1/hor)*sin(pi*i2/ver)*size),
                new Vector(cos(2*pi*j2/hor)*sin(pi*i2/ver)*size, cos(pi*i2/ver)*size, sin(2*pi*j2/hor)*sin(pi*i2/ver)*size),
                new Vector(cos(2*pi*j2/hor)*sin(pi*i1/ver)*size, cos(pi*i1/ver)*size, sin(2*pi*j2/hor)*sin(pi*i1/ver)*size)
            ], new Color(128, 128, 255));
        }
        context.endGroup();

    }

}



class Player {

    var r : number;
    var x : number;
    var y : number;
    var z : number;
    var vx : number;
    var vy : number;
    var vz : number;
    var ax : number;
    var ay : number;
    var az : number;
    var rot : Quaternion;

    function constructor() {
        this.r = 12;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.ax = 0;
        this.ay = -120;
        this.az = 0;
        this.rot = Quaternion.rotating(0, 1, 0, 0);
    }

    function moveForward() : void {
        this.move(50, 0);
    }

    function move(dz:number, dx:number) : void {
        var x = this.vx;
        var z = this.vz;
        var len = Math.sqrt(x*x+z*z);

        // z, x 自体がsin, cos ?
        if (Math.abs(z)>1e-9) z /= len;
        if (Math.abs(x)>1e-9) x /= len;

        var rad = Math.atan2(x, z);

        var sin = Math.sin(rad);
        var cos = Math.cos(rad);

        this.az = cos*dz - sin*dx;
        this.ax = sin*dz + cos*dx;
    }

    function update(elapsedMsec:number) : void {
        var sec = elapsedMsec / 1000;

        this.vx += this.ax * sec;
        this.vy += this.ay * sec;
        this.vz += this.az * sec;

        this.vx = Math.min( 100, Math.max( -100, this.vx));
        this.vy = Math.min(3000, Math.max(-3000, this.vy));
        this.vz = Math.min( 100, Math.max( -100, this.vz));

        var dx = this.vx * sec;
        var dy = this.vy * sec;
        var dz = this.vz * sec;

        this.x += dx;
        this.y += dy;
        this.z += dz;

        this.vx -= Math.abs(dx) * this.vx * 0.01;
        this.vz -= Math.abs(dz) * this.vz * 0.01;

        var v = new Vector(dx, 0, dz);
        var c = v.cross(new Vector(0, 1, 0)).unitSelf();
        var q = Quaternion.rotating(v.abs()/this.r, c);

        this.rot.mulSelf(q);
    }


}



final class _Main {
    static function main(args:string[]) : void {

        Engine.loadImages(['./image/tree.png', './image/so-nya.png', './image/redbull_free.png', './image/sky1.jpg']);

        var engine = new Engine('canvas');

        // engine.setSkyImage('./image/sky1.jpg');

        var trees = [] : Vector[];
        for (var i=0; i<100; i++) {
            var x = Math.floor((Math.random()-0.5)*20)*25;
            var z = Math.floor((Math.random()-0.5)*20)*25;
            trees.push(new Vector(x, -3, z));
        }

        var items = [] : Vector[];
        for (var i=0; i<10; i++) {
            var x = Math.floor((Math.random()-0.5)*500);
            var z = Math.floor((Math.random()-0.5)*500);
            items.push(new Vector(x, -10, z));
        }

        var player = new Player;

        engine.onUpdate = (elapsedMsec:number):void -> {

            player.update(elapsedMsec);

            // 床との当たり判定
            if (player.y < 0) {
                player.vy = - player.vy * 0.5;
                player.y = 0;
            }

            var target = new Vector(player.x, player.y, player.z);

            var z = - player.vz;
            var x = - player.vx;
            var len = Math.sqrt(z*z + x*x);
            if (len<1e-9) {
                z = -1;
                x = 0;
            } else {
                z /= len;
                x /= len;
            }


            var yOffset = 10;
            var xzVelocity = Math.sqrt(player.vx*player.vx+player.vz*player.vz);
            if (xzVelocity < 50) {
                yOffset -= (50 - xzVelocity) * 0.6;
            }
            var view =  new Vector(
                player.x + x*50,
                player.y*1.2 + yOffset,
                player.z + z*50
            );

            engine.camera.target = target;
            engine.camera.view = view;
            engine.camera.updateMatrix();

        };

        var totalElapsedMsec = 0;
        engine.onRender = (context:Context3D, elapsedMsec:number):void -> {
            totalElapsedMsec += elapsedMsec;

            context.translate(player.x, player.y-12, player.z);
            context.rotate(player.rot);
            Util3D.sphere(context, 8, 6);
            context.resetMatrix();

            // var axis = Quaternion.rotating(Math.PI*totalElapsedMsec/200, 0, 1, 0);

            // for (var i=0; i<items.length; i++) {
            //     var x = items[i].x;
            //     var y = items[i].y;
            //     var z = items[i].z;
            //     context.pushMatrix();
            //     context.translate(x, y, z);
            //     context.rotate(axis);
            //     context.renderTexture([
            //         new Vector(-15,-10, 0),
            //         new Vector( 15,-10, 0),
            //         new Vector( 15, 10, 0),
            //         new Vector(-15, 10, 0)
            //     ], './image/redbull_free.png', 2, 2, 1, 1);
            //     context.popMatrix();
            // }

            // context.translate(0, 0, 100);
            // context.rotate(axis);
            // context.renderTexture([
            //     new Vector(-30, -20, 0),
            //     new Vector( 30, -20, 0),
            //     new Vector( 30,  20, 0),
            //     new Vector(-30,  20, 0)
            // ], './image/so-nya.png');
            // context.resetMatrix();

            // for (var i=0; i<trees.length; i++) {
            //     context.renderBillboard(trees[i], 50, 30, './image/redbull_free.png');
            // }


            context.setDepth(5);
            context.beginGroup(new Vector(0, 0, 0), true);
            for (var i=-10; i<10; i++) {
                for (var j=-10; j<10; j++) {
                    context.renderPolygonGroup([
                        new Vector(    i*50, -20,     j*50),
                        new Vector(    i*50, -20, (j+1)*50),
                        new Vector((i+1)*50, -20, (j+1)*50),
                        new Vector((i+1)*50, -20,     j*50)
                    ], new Color(128, 255, 128));
                }
            }
            context.endGroup();

        };

        if (engine.isMobile) {

            dom.window.addEventListener('devicemotion', (e:Event):void -> {
                var de = e as DeviceMotionEvent;

                var az = (de.accelerationIncludingGravity['y'] as number) * 30;
                var ax = (de.accelerationIncludingGravity['x'] as number) * 30;
                az = Math.max(ax, 0);
                player.move(az, ax);
            });

            dom.window.addEventListener('touchstart', (e:Event):void -> {
                player.vy = 80;
            });

        } else {

            dom.window.document.onkeypress = (e:Event):void -> {
                var ke = e as KeyboardEvent;
                var accel = 80;
                switch (ke.keyCode) {
                    case 119: // 'w'
                        player.move(accel, 0);
                        break;
                    case 115: // 's'
                        player.move(0, 0);
                        break;
                    case 97:  // 'a'
                        player.move(0,-accel);
                        break;
                    case 100: // 'd'
                        // player.ax = 50;
                        player.move(0, accel);
                        break;
                    case 106: // 'j'
                        break;
                    case 107: // 'k'
                        break;
                    case 32:  // ' '
                        player.vy = 80;
                        break;
                }
            };

        }

        engine.start();

        // var move = ():void -> {
        //     engine.camera.move(new Vector(0, 0, 5));
        //     engine.camera.rotateY(Math.PI / 64);
        //     engine.updateMatrix();
        //     Timer.setTimeout(move, 10);
        // };
        // Timer.setTimeout(move, 10);
    }

}
