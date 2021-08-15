---
title: "A Game Jam Retrospective: Grook"
date: 2020-01-09
excerpt: "Looking back on things I could have done differently"
---

Having nothing better to do after having finished my internship at NOAA this summer, I decided to participate in a <a href="https://itch.io/jam/miz-jam-1">game jam</a>, and see what I could throw together using the Godot game engine in 48 hours. Out came Grook, a gravity and hook-based platformer!

I thought I'd document my process, and discuss some aspects of the game here (kind of like a brief devlog).

First, the inspiration: Oftentimes, game jams put into place restrictions or themes, to make it more interesting and force people to think outside the box. In this case, all the developers were restricted to a single art kit, the <a href="https://kenney.nl/assets/bit-pack">Kenney 1-Bit Pack</a>, so I started there, looking over the assets and trying to see if there was anything particularily interesting that caught my attention. I liked the look of the hook, so I, on a whim, decided to try to make a hook platformer. I didn't want to just make another boring hook platformer (though if it gets the feel right, these can be fun), and I'm interested in strange/novel mechanics, so I started thinking about changing the other main component of swinging platformers - gravity. 

After some thinking, and after programming the hook mechanic (some pythagorean theorem and physics stuff going on), I started playing with the idea of changing gravity's direction every time you released the hook. This ended up being a pretty fun idea, and I set it up so that you would set the new "down" direction by which way the hook was facing. So, if you swung and let go at a 45 degree angle, then gravity would suddenly point in this new direction.

At this point, a big problem was the camera. It was jarring to suddenly have a change in direction every time you let go, and it messed up the feel of the swings a lot. So, I settled on having a camera that was locked onto the player. This meant that when the player rotated while swinging, the camera would rotate too, and when the player let go, the camera would already be facing towards the new downwards direction.

In terms of how I implemented all this, it was just a bunch of pretty trivial vector math. The code is available on github, though it's gross and I haven't touched it since the jam finished, so don't judge me for it.

The controls are fairly straightforward: A and D to move, click and hold to send out and swing from your hook, and space to jump. You can jump directly from the rope while swinging, and if you release from the hook, you can jump once in midair.

Below is an embedded version of the game (should work on Chrome and Firefox, maybe not Safari/Edge/Opera/w3m/Links/Brave/whoknowswhat):

<iframe mozallowfullscreen="true" allow="autoplay; fullscreen *;" src="../attachments/grook/grook.html" msallowfullscreen="true" scrolling="no" allowfullscreen="true" webkitallowfullscreen="true" id="game_drop" allowtransparency="true" frameborder="0" width="80%"></iframe>

