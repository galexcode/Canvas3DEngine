import "./vector.jsx";
import "./matrix.jsx";
import "./quaternion.jsx";
import "./engine.jsx";
import "./list.jsx";
import "js/web.jsx";
import "timer.jsx";

class Util3D {

    /**
     * render sphere
     */
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

    /**
     * render XZ floor tile
     */
    static function tileOnGroup(context:Context3D, x:int, y:int, z:int, size:int, color:Color) : void {
        context.renderPolygonGroup([
            new Vector(x-size/2, y, z-size/2),
            new Vector(x-size/2, y, z+size/2),
            new Vector(x+size/2, y, z+size/2),
            new Vector(x+size/2, y, z-size/2)
        ], color);
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
    var radius : int;
    var isBraking : boolean;

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
        this.radius = 8;
        this.isBraking = true;
    }

    function moveForward() : void {
        this.move(50, 0);
    }

    function move(dz:number, dx:number) : void {
        this.isBraking = false;

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

    function brake() : void {
        this.isBraking = true;
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

        var velocityDecl = (this.isBraking) ? 0.1 : 0.01;

        this.vx -= Math.abs(dx) * this.vx * velocityDecl;
        this.vz -= Math.abs(dz) * this.vz * velocityDecl;

        if (this.isBraking) {
            var decl = Math.pow(Math.E, -sec);
            this.az *= decl;
            this.ax *= decl;
        }

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

        engine.setSkyImage('./image/sky1.jpg');

        var trees = new List.<Vector>;
        var treeRadius = 30;
        // for (var i=0; i<10; i++) {
        //     var x = Math.floor((Math.random()-0.5)*20)*25;
        //     var z = Math.floor((Math.random()-0.5)*20)*25;
        //     trees.append(new Vector(x, -3, z));
        // }

        var items = new List.<Vector>;
        var itemRadius = 8;
        // for (var i=0; i<10; i++) {
        //     var x = Math.floor((Math.random()-0.5)*500);
        //     var z = Math.floor((Math.random()-0.5)*500);
        //     items.append(new Vector(x, -10, z));
        // }

        var player = new Player;

        engine.onUpdate = (elapsedMsec:number):void -> {

            player.update(elapsedMsec);

            var x = player.x;
            var z = player.z;
            // 床との当たり判定
            if (
                ( -30 <= x && x <=  30 && -30 <= z && z <= 150) || // starting floor
                (-300 <= x && x <= 300 && 150 <= z && z <= 750)
            ) {
                if (player.y < 0) {
                    player.vy = - player.vy * 0.5;
                    player.y = 0;
                }
            }

            // 木との当たり判定
            for (var n=trees.head; n; n=n.next()) {
                var tree = n.value;
                var dx = player.x - tree.x;
                var dy = player.y - tree.y;
                var dz = player.z - tree.z;

                var dr = treeRadius + player.radius;

                if (dx*dx+dy*dy+dz*dz < dr*dr) {
                    var normalVec = new Vector(dx, dy, dz).unitSelf();
                    var a = Math.sqrt(player.vx*player.vx+player.vy*player.vy+player.vz*player.vz);
                    player.ax += 2 * a * normalVec.x;
                    player.vy += 2 * a * normalVec.y;
                    player.az += 2 * a * normalVec.z;

                    player.x += normalVec.x * treeRadius / 4;
                    player.z += normalVec.z * treeRadius / 4;
                }
            }

            // アイテムとの当たり判定
            for (var n=items.head; n; n=n.next()) {
                var item = n.value;
                var dx = item.x - player.x;
                var dy = item.y - player.y;
                var dz = item.z - player.z;

                var dr = itemRadius + player.radius;

                if (dx*dx+dy*dy+dz*dz < dr*dr) {
                    items.remove(n);
                }
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


            var y = player.y;
            if (y < 0) y = -y / 2;
            var yOffset = 10;
            var xzVelocity = Math.sqrt(player.vx*player.vx+player.vz*player.vz);
            if (xzVelocity < 50) {
                yOffset -= (50 - xzVelocity) * 0.6;
            }
            var view =  new Vector(
                player.x + x*50,
                y*1.2 + yOffset,
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
            Util3D.sphere(context, player.radius, 6);
            context.resetMatrix();

            var axis = Quaternion.rotating(Math.PI*totalElapsedMsec/1000, 0, 1, 0);

            for (var n=items.head; n; n=n.next()) {
                var item = n.value;
                var x = item.x;
                var y = item.y;
                var z = item.z;
                context.pushMatrix();
                context.translate(x, y, z);
                context.rotate(axis);
                context.renderTexture([
                    new Vector(-15,-10, 0),
                    new Vector( 15,-10, 0),
                    new Vector( 15, 10, 0),
                    new Vector(-15, 10, 0)
                ], './image/redbull_free.png', 2, 2, 1, 1);
                context.popMatrix();
            }

            for (var n=trees.head; n; n=n.next()) {
                var tree = n.value;
                var x = tree.x;
                var y = tree.y;
                var z = tree.z;
                context.pushMatrix();
                context.translate(x, y, z);
                context.renderBillboard(new Vector(0, 0, 0), 50, 34, './image/tree.png');
                context.popMatrix();
            }

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
            var grayColor = new Color(192, 192, 192);
            var size = 30;
            for (var i=0; i<6; i++) {
                Util3D.tileOnGroup(context, -15, -20, -15+i*size, size, grayColor);
                Util3D.tileOnGroup(context, +15, -20, -15+i*size, size, grayColor);
            }
            var lightGreen = new Color(160, 255, 160);
            var green = new Color(96, 255, 96);
            context.pushMatrix();
            context.translate(0, 0, 450);
            for (var i=0; i<20; i++) {
                for (var j=0; j<20; j++) {
                    var color = (i+j)%2==0 ? lightGreen : green;
                    Util3D.tileOnGroup(context, i*30-285, -20, j*30-285, 30, color);
                }
            }
            // for (var i=-10; i<10; i++) {
            //     for (var j=-10; j<10; j++) {
            //         context.renderPolygonGroup([
            //             new Vector(    i*50, -20,     j*50),
            //             new Vector(    i*50, -20, (j+1)*50),
            //             new Vector((i+1)*50, -20, (j+1)*50),
            //             new Vector((i+1)*50, -20,     j*50)
            //         ], new Color(128, 255, 128));
            //     }
            // }
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

            dom.window.document.addEventListener('keypress', (e:Event):void -> {
                var ke = e as KeyboardEvent;
                var accel = 100;
                switch (ke.keyCode) {
                    case 119: // 'w'
                        player.move(accel, 0);
                        break;
                    case 115: // 's'
                        // player.move(0, 0);
                        player.brake();
                        break;
                    case 97:  // 'a'
                        player.move(0,-accel/2);
                        break;
                    case 100: // 'd'
                        // player.ax = 50;
                        player.move(0, accel/2);
                        break;
                    case 106: // 'j'
                        log items;
                        break;
                    case 107: // 'k'
                        break;
                    case 32:  // ' '
                        player.vy = 80;
                        break;
                }
            }, false);

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
