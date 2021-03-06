// Keep all methods static for easier updates
class Player {
    constructor(name) {
        // Username and other basic info
        this.username = name;

        // Current Station details
        this.money = 100;

        // Current game world details
        this.gameworlds = []; // all game worlds active - deactivate when miner is destroyed
        this.playing = null; // the current game world that needs to be drawn and interacted with 

        //UPGRADE STATS
        this.upgrades = [];
        this.upgrades["maxWorlds"] = 1;

        this.upgrades["turret"] = [];
        this.upgrades["turret"]["upgradeCost"] = 2;
        this.upgrades["turret"]["speedRate"] = 1.1; //max of 1.2-1.5 probably?
        this.upgrades["turret"]["speedMax"] = 1;
        this.upgrades["turret"]["damageRate"] = 1.1;
        this.upgrades["turret"]["damageMax"] = 1;
        this.upgrades["turret"]["precisionRate"] = 1.1;
        this.upgrades["turret"]["precisionMax"] = 1;
        this.upgrades["turret"]["splashRate"] = 1.1;
        this.upgrades["turret"]["splashMax"] = 1;
    }

    /**
     * @param {Player} p 
     * @returns {string} */
    static serialize(p) {
        return JSON.stringify(p);
    }

    /** 
     * @param {string} s serialized string
     * @returns {Player}
    */
    static from(s) {
        // this doesn't handle that some of the NESTED classes are not static based!
        const obj = JSON.parse(s);
        return obj;
    }

    static saveData(p){
        localStorage.setItem("ForeverMinerSave", Player.serialize(p));
    }

    static loadData(p){
        return Player.from(localStorage.getItem("ForeverMinerSave"));
    }
}