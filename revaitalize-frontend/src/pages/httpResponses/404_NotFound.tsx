import Link from "next/link"

export default function Component() {
	return (
		<section className="flex flex-col items-center w-full py-12 text-center md:py-24">
			<img
				src="/placeholder.svg"
				width="400"
				height="300"
				alt="Illustration"
				className="rounded-xl object-cover"
				style={{ aspectRatio: "400/300", objectFit: "cover" }}
			/>
			<div className="container flex flex-col items-center justify-center gap-2 px-4 md:gap-4 lg:gap-6">
				<div className="space-y-2">
					<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Lost in the clouds</h1>
					<p className="text-gray-500 md:w-2/4 lg:w-1/2 xl:w-1/3 dark:text-gray-400">
						Whoops, looks like you took a wrong turn. Let&#x27;s get you back home.
					</p>
				</div>
				<Link
					href="#"
					className="inline-flex h-9 items-center rounded-md border border-gray-200 border-gray-200 bg-white px-4 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-950 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
					prefetch={false}
				>
					Go back home
				</Link>
			</div>
		</section>
	)
}
