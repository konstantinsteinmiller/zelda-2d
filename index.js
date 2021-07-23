kaboom({
	global: true,
	fullscreen: true,
	scale: 1,
	debug: true,
	clearColor: [0,0,0,1]
})
const MOVE_SPEED = 120
const SLICER_SPEED = 100
const SKELETOR_SPEED = 60

//Game Logic
loadRoot('https://i.imgur.com/')
loadSprite('link-going-left', '1Xq9biB.png')
loadSprite('link-going-right', 'yZIb8O2.png')
loadSprite('link-going-down', 'r377FIM.png')
loadSprite('link-going-up', 'UkV0we0.png')
loadSprite('left-wall', 'rfDoaa1.png')
loadSprite('top-wall', 'QA257Bj.png')
loadSprite('bottom-wall', 'vWJWmvb.png')
loadSprite('right-wall', 'SmHhgUn.png')
loadSprite('bottom-left-wall', 'awnTfNC.png')
loadSprite('bottom-right-wall', '84oyTFy.png')
loadSprite('top-left-wall', 'xlpUxIm.png')
loadSprite('top-right-wall', 'z0OmBd1.jpg')
loadSprite('top-door', 'U9nre4n.png')
loadSprite('fire-pot', 'I7xSp7w.png')
loadSprite('left-door', 'okdJNls.png')
loadSprite('lanterns', 'wiSiY09.png')
loadSprite('slicer', 'c6JFi5Z.png')
loadSprite('skeletor', 'Ei1VnX8.png')
loadSprite('kaboom', 'o9WizfI.png')
loadSprite('stairs', 'VghkL08.png')
loadSprite('bg', 'u4DVsx6.png')



scene('game', ({ level, score }) => {
	layers(['bg', 'obj', 'ui'], 'obj')
	
  const maps = [
  	[
			'zcc)cc^ccw',
			'a        b',
			'a      * b',
			'a    (   b',
			'%        b',
			'a    (   b',
			'a   *    b',
			'a        b',
			'xdd)dd)ddy',
		],
  	[
			'zccc)ccccccw',
			'a          b',
			'a    *     b',
			')          )',
			'a          b',
			'a      $   b',
			')   }      )',
			'a       *  b',
			'a          b',
			'xddddddddddy',
		]
	]

	const levelCfg = {
  	width: 48,
		height: 48,
		'a': [sprite('left-wall'), solid(), 'wall'],
		'b': [sprite('right-wall'), solid(), 'wall'],
		'c': [sprite('top-wall'), solid(), 'wall'],
		'd': [sprite('bottom-wall'), solid(), 'wall'],
		'w': [sprite('top-right-wall'), solid(), 'wall'],
		'z': [sprite('top-left-wall'), solid(), 'wall'],
		'x': [sprite('bottom-left-wall'), solid(), 'wall'],
		'y': [sprite('bottom-right-wall'), solid(), 'wall'],
		'%': [sprite('left-door'), solid(), 'wall', 'door'],
		'^': [sprite('top-door'), 'next-level', 'wall'],
		'$': [sprite('stairs'), 'next-level'],
		'*': [sprite('slicer'), 'slicer', 'dangerous', { dir: -1 }],
		'}': [sprite('skeletor'), 'skeletor', 'dangerous', { dir: -1, timer: 0 }],
		')': [sprite('lanterns'), solid()],
		'(': [sprite('fire-pot'), solid()],
	}
	addLevel(maps[level], levelCfg)
	
	add([sprite('bg'), layer('bg')])

	const scoreLabel = add([
		text(score.toString()),
		pos(400, 500),
		layer('ui'),
		{ 
			value: score
		},
		scale(2),
	])

	add([
		text('level ' + (+level+1)),
		pos(400, 535),
		scale(2)
	])

	const player = add([
		sprite('link-going-right'),
		pos(53, 190),
		{
			// right by default
			dir: vec2(1, 0)
		}
	])

	player.action(() => {
		player.resolve()
	})

	keyDown('left', () => {
	  player.changeSprite('link-going-left')
		player.move(-MOVE_SPEED, 0)
		player.dir = vec2(-1, 0)
	})
	keyDown('right', () => {
	  player.changeSprite('link-going-right')
		player.move(MOVE_SPEED, 0)
		player.dir = vec2(1, 0)
	})
	keyDown('up', () => {
	  player.changeSprite('link-going-up')
		player.move(0, -MOVE_SPEED)
		player.dir = vec2(0, -1)
	})
	keyDown('down', () => {
	  player.changeSprite('link-going-down')
		player.move(0,MOVE_SPEED)
		player.dir = vec2(0, 1)
	})

	function spawnKaboom(p) {
		const kaboomObj = add([sprite('kaboom'), pos(p), 'kaboom'])
		wait(1, () => {
		  destroy(kaboomObj)
		})
	}

	keyPress('space', () => {
		spawnKaboom(player.pos.add(player.dir.scale(48)))
	})

	action('slicer', (s) => {
		s.move(s.dir * SLICER_SPEED, 0)
	})

	collides('slicer', 'wall', (s) => {
		s.dir = -s.dir
	})

	action('skeletor', (skeletor) => {
		skeletor.move(0, skeletor.dir * SKELETOR_SPEED)
		skeletor.timer -= dt()
		if(skeletor.timer <= 0){
			skeletor.dir = -skeletor.dir
			skeletor.timer = rand(5)
		}
	})
	collides('skeletor', 'wall', (s) => {
		s.dir = -s.dir
	})
	collides('skeletor', 'kaboom', (s, k) => {
		wait(1, () => {
			destroy(k)
		})
		destroy(s)
		camShake(4)
		scoreLabel.value += 50
		scoreLabel.text = scoreLabel.value
	})

	player.collides('door', (d) => {
		wait(0.5, () => {
			destroy(d)
		})
	})
	player.overlaps('next-level', () => {
		wait(1, () => {
			go('game', {
					level: ++level % maps.length,
					score: scoreLabel.value
				}
			)
		})
	})

	player.overlaps('dangerous', () => {
		go('lose', { score: scoreLabel.value })
	})
})

// define a button
function addButton(txt, p, width, callack) {
	const bg = add([
		pos(p),
		rect(width, 30),
		origin("center"),
		color(1, 1, 1),
	]);

	add([
		text(txt),
		pos(p),
		origin("center"),
		color(1, 0, 0),
	]);

	bg.action(() => {
		if (bg.isHovered()) {
			bg.color = rgb(0, 0.8, 0.8);
			if (mouseIsClicked()) {
				callack();
			}
		} else {
			bg.color = rgb(1, 1, 1);
		}
	});

}

scene('lose', ({ score }) => {
	add(
		[text('Your score: ' + score, 32),
		origin('center'),
		pos(width()/2, height()/2)]
	)

	addButton("Start the game", vec2(width()/2, height()/2 + 50), 150, () => {
		go('game', {
				level: 0,
				score: 0
			}
		)
	});

	addButton("quit", vec2(width()/2, height()/2 + 95), 60, () => {
		alert("bye");
	});
})

start('game', { level: 0, score: 0 })