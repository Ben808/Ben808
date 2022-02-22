import Phaser from 'https://codepen.io/libe2022/pen/poWbMod.js'
import Game from 'https://codepen.io/libe2022/pen/RwLRXNN.js'
export default new Phaser.Game({
	type: Phaser.AUTO,
	//makes it 480x640 aspect ratio or vertical
	width: 480,
	height: 640,
	//scenes used so whatever I want to show
	scene: Game,
	//physics engine using arcade, gravity being 200
	physics: {
    	default: 'arcade',
    	arcade: {
        	gravity: {
            	y: 200
        	},
        	debug: true
    	}
	}
});

