export function StaffIndex() {
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Staff</h1>
			<div className="p-4 border rounded">
				<p className="mb-4">Welcome to the staff area.</p>
				<a href="/account/staff/economy-transactions" className="link text-blue-500 hover:underline">
					Economy Transactions
				</a>
			</div>
		</div>
	);
}
