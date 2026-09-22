<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className = '', ...restProps }: Props = $props();
</script>

<div
	class="animate-pulse rounded-md bg-[#E8DFD0]/70 dark:bg-stone-800 {className}"
	{...restProps}
></div>
