import "js/web.jsx";

/**
 * $BFs<!85J?LL$G$NHFMQ4X?t$r$^$H$a$?%/%i%9(B
 */
class Math2D {

    /**
     * $B%Y%/%H%k$N30@Q(B
     */
    static function cross(x1:number, y1:number, x2:number, y2:number) : number {
        return x1*y2 - x2*y1;
    }

}



// $B%/%i%9L>$r(BTimer$B$K$7$?$+$C$?!&!&!&(B
/**
 * $B;~4V7WB,$r9T$&%?%$%^!<%/%i%9(B
 */
class Stopwatch {

    var _elapsedMsec : number;
    var _startedMsec : Nullable.<number>;
    var _lastLapMsec : Nullable.<number>;

    function constructor() {
        this._elapsedMsec = 0;
        this._startedMsec = null;
    }

    function _currentMsec() : number {
        return Date.now();
    }

    function start() : void {
        assert this._startedMsec == null;

        this._startedMsec = this._lastLapMsec = this._currentMsec();
    }

    function stop() : void {
        assert this._startedMsec != null;

        this._elapsedMsec += this._currentMsec() - this._startedMsec;
        this._startedMsec = null;
        this._lastLapMsec = null;
    }

    function isStarted() : boolean {
        return this._startedMsec != null;
    }

    function isStopped() : boolean {
        return this._startedMsec == null;
    }

    /**
     * $BA02s(Blap$B4X?t$r8F$s$@;~4V(B($B$^$?$O%9%?!<%H$5$;$?;~4V(B)$B$+$i$N7P2a;~4V$r%_%jIC$GJV$9(B
     * @returns {number} $B7P2a;~4V(B
     */
    function lap() : number {
        assert this._lastLapMsec != null;

        var currentMsec = this._currentMsec();
        var lapMsec = currentMsec - this._lastLapMsec;
        this._lastLapMsec = currentMsec;

        return lapMsec;
    }

    function getElapsedMsec() : number {
        return this._elapsedMsec;
    }

}



/**
 * $B%2!<%`$G$N#1ICJU$j$N%U%l!<%`$N99?72s?t$r7WB,$9$k%/%i%9(B
 */
class FpsManager {

    var _stopwatch : Stopwatch;
    var _recentlyMsecLog : number[];
    var _lastMsec : number;
    var _fpsElement : Nullable.<HTMLElement>;
    var _enabledHtmlLog : boolean;
    var _enabledConsoleLog : boolean;

    function constructor() {
        this._fpsElement = null;
        this._stopwatch = new Stopwatch;
        this._recentlyMsecLog = [] : number[];
        this._lastMsec = 0;

        this._enabledHtmlLog = false;
        this._enabledConsoleLog = true;
    }

    function constructor(spanId:string) {
        this._fpsElement = dom.id(spanId);
        this._stopwatch = new Stopwatch;
        this._recentlyMsecLog = [] : number[];
        this._lastMsec = 0;

        this._enabledHtmlLog = true;
        this._enabledConsoleLog = false;
    }

    function start() : void {
        this._stopwatch.start();
    }

    function lastLap() : number {
        return this._lastMsec;
    }

    /**
     * $B%U%l!<%`$r99?7$7$?%?%$%_%s%0$G8F$V$3$H$G!"(Bfps$B$r7W;;$7(Bdom$BMWAG$^$?$O(Bconsole$B$KI=<($9$k(B
     */
    function update() : void {
        assert !this._stopwatch.isStopped();

        var lap = this._stopwatch.lap();
        this._lastMsec = lap;
        if (this._recentlyMsecLog.length < 1) {
            this._recentlyMsecLog.push(lap);
        } else {
            this._recentlyMsecLog.push(lap);
            this._recentlyMsecLog.shift();
        }

        var length = this._recentlyMsecLog.length;

        var totalMsec = 0;
        for (var i=0; i<length; i++) {
            totalMsec += this._recentlyMsecLog[i];
        }
        var fps = length / (totalMsec / 1000);

        if (this._fpsElement!=null && this._enabledHtmlLog) {
            this._fpsElement.innerHTML = fps.toFixed(1) + "fps";
        } else if (this._enabledConsoleLog) {
            log fps.toFixed(1) + "fps";
        }
    }

}


