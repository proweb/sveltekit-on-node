<div class="space-y-4">
	{#each [1, 2, 3, 4] as key (key)}
		<div class="p-4 rounded-xl border bg-card space-y-3 animate-pulse">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<div class="h-8 w-8 rounded-lg bg-muted"></div>
					<div class="space-y-1.5">
						<div class="h-4 w-40 rounded bg-muted"></div>
						<div class="h-3 w-60 rounded bg-muted/60"></div>
					</div>
				</div>
				<div class="h-6 w-12 rounded bg-muted"></div>
			</div>
			<div class="flex items-center justify-between pt-2 border-t">
				<div class="h-3 w-28 rounded bg-muted/60"></div>
				<div class="h-3 w-20 rounded bg-muted/60"></div>
			</div>
		</div>
	{/each}
</div>
