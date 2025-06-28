import { FiHome, FiBarChart, FiUser, FiCodepen } from "react-icons/fi";
import { type IconType } from "react-icons";

function RouteSelect() {
	return (
		<div className="space-y-2">
			<Route Icon={FiHome} selected={true} title="Dashboard"></Route>
			<Route Icon={FiUser} selected={false} title="Profile"></Route>
			<Route Icon={FiCodepen} selected={false} title="Exercises"></Route>
			<Route Icon={FiBarChart} selected={false} title="Session"></Route>
		</div>
	)
}

const Route = ({
	selected,
	Icon,
	title,
}: {
	selected: boolean;
	Icon: IconType;
	title: string;
}) => {

	return <button
		className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow_background-color_color]
		${selected
				? "bg-base-200 shadow font-semibold"
				: "hover:bg-base-200 hover:shadow bg-transparent text-bg-constant shadow-none"}
					`}>
		<Icon className={selected ? "text-primary base-content" : ""} />
		<span>{title}</span>
	</button>

}

export default RouteSelect
