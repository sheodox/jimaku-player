<style>
	.an {
        position: fixed;
        width: 100%;
        max-width: 100vw;
		display: flex;
		flex-direction: column;
		/* eventually need to pay attention to the margin on subtitles for accuracy's sake,
		 but this should keep it from being too close to the edge of the screen until then*/
		padding: 0.8rem;
    }
	/* unless you're using the legacy \a alignment override, the alignments are like the 1-9 keys on the number pad,
    so for example 1=bottom left, 5=middle center, 9=top right, that point is its anchor, so the text needs to be
    translated to not go off screen or not be in a weird place. so alignment 9 should be translated so its as if
    the text grows down and to the left. likewise alignment 1 should be translated to grow upwards and to the right.

    for the legacy \a alignments, they're translated to \an alignments by the parser and treated equal here
     */
	.an1 {
		top: 100vh;
		left: 0;
		transform: translate(0, -100%);
	}
	.an2 {
        top: 100vh;
        left: 50vw;
        transform: translate(-50%, -100%);
	}
    .an3 {
        top: 100vh;
        left: 100vw;
        transform: translate(-100%, -100%);
    }
	.an4 {
		top: 50vh;
		left: 0;
		transform: translate(0, -50%);
	}
    .an5 {
        top: 50vh;
        left: 50vw;
        transform: translate(-50%, -50%);
    }
    .an6 {
        top: 50vh;
        left: 100vw;
        transform: translate(-100%, -50%);
    }
	.an7 {
		top: 0;
		left: 0;
		transform: translate(0, 0);
	}
    .an8 {
        top: 0;
        left: 50vw;
        transform: translate(-50%, 0);
    }
    .an9 {
        top: 0;
        left: 100vw;
        transform: translate(-100%, 0);
    }

	.an1, .an4, .an7 {
		text-align: left;
	}
	.an2, .an5, .an8 {
		text-align: center;
	}
	.an3, .an6, .an9 {
		text-align: right;
	}

	/* all the bottom alignments grow upward with new subtitles, i.e. the first sub
	should show along the bottom edge of the screen, and subsequent ones on top of it*/
	.an1, .an2, .an3 {
		flex-direction: column-reverse;
	}
	.non-actionable {
		pointer-events: none;
	}
</style>

<script>
	import {derived} from 'svelte/store';
	import ASSSubtitle from "./ASSSubtitle.svelte";
	import {invertVerticalAlignment} from "../settingsStore";
	import {subtitleActionable} from "./render-common";

	export let subtitles; //store for which subtitles should be shown each frame
	export let styles = {}; // base styles from the subtitle file

	const alignments = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	//the 'invert subtitle vertical alignment' checkbox in the tray controls
	//which side of the screen a subtitle that's positioned by alignment shows on.
	//this lets the user view both english and japanese subtitles simultaneously,
	//as they'd probably otherwise both be trying to display on the bottom,
	//inverting them will show the built in english subs on the bottom, and these
	//subs on the top. this only makes sense for aligned subtitles, as positioned
	//subtitles probably are tracking something in the video, like a sign, and
	//moving those around would make it not line up with whatever it's trying to track
	const invertedAlignments = {
		1: 7,
		2: 8,
		3: 9,
		4: 4,
		5: 5,
		6: 6,
		7: 1,
		8: 2,
		9: 3
	};

	function emptyArrangement(level) {
		return {
			level,
			positioned: [],
			//'an' is a reference to the \an override tag, though the alignment here could have come
			//from the base style the subtitle inherits from if it's not overridden
			an1: [],
			an2: [],
			an3: [],
			an4: [],
			an5: [],
			an6: [],
			an7: [],
			an8: [],
			an9: [],
		}
	}

	//subtitles come in as a store of an array of all subtitles shown on screen at the time,
	//but ASS subtitles need to be positioned in one of a few different containers, it's easier
	//to compute each subtitle's destination here in a derived store than in html
	const layers = derived(subtitles, subs => {
		//positioned elements are rendered as-is wherever the subtitles say they should be,
		//but any of the tags with an alignment are mounted into a common container so they
		//can flow within that container and not overlap. this way the browser can flow
		//the text however it chooses and we don't need to do any collision resolution calculations.
		//additionally subtitles have "layers", subs on different layers don't compete with each
		//other during collision resolution, i.e. subs on different layers can overlap if they
		//have the same alignment. higher number layers will show on top of the others, so this
		//basically just corresponds to a z-index number.
		const layerMounts = {};
		for (const sub of subs) {
			const mount = sub.mountPoint === 'positioned' ?
				sub.mountPoint :
				`an${$invertVerticalAlignment ? invertedAlignments[sub.mountPoint] : sub.mountPoint}`
			if (!layerMounts[sub.layer]) {
				layerMounts[sub.layer] = emptyArrangement(sub.layer)
			}
			layerMounts[sub.layer][mount].push(sub);
		}

		//since z-index handles which show on top there's no need to sort the array coming from this
		return Object.values(layerMounts);
	});
</script>

<div class="subtitles" class:non-actionable={!$subtitleActionable}>
	{#each $layers as arrangement (arrangement.level)}
		<div data-ass-layer={arrangement.level} style="position: absolute; z-index: {arrangement.level}">
			{#each arrangement.positioned as sub (sub._id)}
				<ASSSubtitle {sub} {styles} on:define-pauser />
			{/each}
			{#each alignments as an (an)}
				{#if arrangement[`an${an}`].length}
					<div class="an an{an}">
						{#each arrangement[`an${an}`] as sub (sub._id)}
							<ASSSubtitle {sub} {styles} on:define-pauser />
						{/each}
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>
