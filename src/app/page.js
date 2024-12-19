import { ResourceMap } from "@/components/ResourceMap";
import { EmergencyActions } from "@/components/EmergencyActions";
import {communityhome} from "@/components/ui/communityhome";
import {emergencytoolkit} from "@/components/ui/emergencytoolkit";
import {VolunteerForm,SeekHelpForm} from "@/components/ui/vounteerandhelp";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {login} from "@/components/ui/login";
import {Hero} from "@/components/ui/Hero";

export default function Home() {
	return (
		<div className="space-y-8">
			<section className="bg-white rounded-lg shadow-xl p-6">
				<h1 className="text-4xl font-bold mb-4">
					Community Sheild -Hyper local disaster network
				</h1>
				<p className="text-gray-600 text-lg">
					Access critical resources, connect with skilled volunteers, and stay
					informed during emergencies - even without internet connectivity.All you need is Bluetooth connectivity or a wifi direct
				</p>
			</section>
			<ResourceMap />
			<EmergencyActions />
			
		</div>
	);
}
