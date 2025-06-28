function AccountToggle() {
	return (
		<div className="pt-8 border-base-content flex flex-col h-12 border-t px-2 justify-end text-xs">
			<button className="flex p-0.5 pe-2 hover:bg-base-200 rounded transition-colors relative gap-2 w-full items-center">
				<img
					src="https://api.dicebear.com/9.x/thumbs/svg?shapeColor=0a5b83"
					alt="avatar"
					className="size-8 rounded shrink-0 shadow"
				/>
				<div className="text-start">
					<span className="text-sm font-bold block">Aaron Lim</span>
					<span className="text-xs block neutral-content">aaron.lim@gmail.com</span>
				</div>
				{/* <FiChevronDown className="absolute right-2 top-1/2 translate-y-[calc(-50%+4px)] text-xs" /> */}
				{/* <FiChevronUp className="absolute right-2 top-1/2 translate-y-[calc(-50%-4px)] text-xs" /> */}
			</button>
		</div>
	)
}

export default AccountToggle
