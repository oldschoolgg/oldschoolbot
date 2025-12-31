import { type ColumnDef, flexRender, getCoreRowModel, type SortingState, useReactTable } from '@tanstack/react-table';
import * as React from 'react';

import type { EconomyTransaction, TransactionType } from './economyTransactions.js';
import { toTitleCase } from '@oldschoolgg/util';
import { timeAgo } from '@/lib/utils.js';

export type TransactionTableSortStatus<T> = {
	columnAccessor: keyof T | string;
	direction: 'asc' | 'desc';
};

interface TransactionTableProps {
	transactions: EconomyTransaction[];
	loading: boolean;
	total: number;
	page: number;
	pageSize: number;
	sortStatus: TransactionTableSortStatus<EconomyTransaction>;
	onPageChange: (page: number) => void;
	onSortStatusChange: (status: TransactionTableSortStatus<EconomyTransaction>) => void;
}

function clamp(n: number, min: number, max: number) {
	return Math.max(min, Math.min(max, n));
}

function toSortingState<T>(sortStatus: TransactionTableSortStatus<T>): SortingState {
	const id = String(sortStatus.columnAccessor);
	return [{ id, desc: sortStatus.direction === 'desc' }];
}

function fromSortingState<T>(
	sorting: SortingState,
	fallback: TransactionTableSortStatus<T>
): TransactionTableSortStatus<T> {
	const first = sorting[0];
	if (!first) return fallback;
	return { columnAccessor: first.id, direction: first.desc ? 'desc' : 'asc' };
}

export function TransactionTable({
	transactions,
	loading,
	total,
	page,
	pageSize,
	sortStatus,
	onPageChange,
	onSortStatusChange
}: TransactionTableProps) {
	const columns = React.useMemo<ColumnDef<EconomyTransaction>[]>(
		() => [
			{
				accessorKey: 'date',
				header: 'Date',
				cell: ({ row }) => (
					<div className='flex items-center flex-col'>
						{new Date(row.original.date).toLocaleString()}
						<p className='text-xs'>{timeAgo(new Date(row.original.date))}</p>
					</div>
				),
				enableSorting: true
			},
			{
				accessorKey: 'type',
				header: 'Type',
				cell: ({ row }) => {
					const t = row.original.type;
					return (
						<span
							className="">
							{toTitleCase(t)}
						</span>
					);
				},
				enableSorting: true
			},
			{
				accessorKey: 'sender',
				header: 'Sender',
				cell: ({ row }) => <span className="font-mono text-sm">{String(row.original.sender)}</span>,
				enableSorting: true
			},
			{
				accessorKey: 'recipient',
				header: 'Recipient',
				cell: ({ row }) => <span className="font-mono text-sm">{String(row.original.recipient)}</span>,
				enableSorting: true
			},
			{
				accessorKey: 'guild_id',
				header: 'Guild ID',
				cell: ({ row }) =>
					row.original.guild_id ? (
						<span className="font-mono text-sm">{String(row.original.guild_id)}</span>
					) : (
						<span className="text-slate-400">-</span>
					),
				enableSorting: true
			}
		],
		[]
	);

	const sorting = React.useMemo(() => toSortingState(sortStatus), [sortStatus]);

	const table = useReactTable({
		data: transactions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		state: { sorting },
		manualSorting: true,
		enableMultiSort: false,
		enableSortingRemoval: false,
		onSortingChange: updater => {
			const next = typeof updater === 'function' ? updater(sorting) : updater;
			onSortStatusChange(fromSortingState<EconomyTransaction>(next, sortStatus));
		}
	});

	const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
	const safePage = clamp(page, 1, totalPages);

	const startIdx = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
	const endIdx = Math.min(total, safePage * pageSize);

	return (
		<div className="rounded-xl border border-[var(--color-border)] shadow-sm">
			<div className="overflow-x-auto">
				<table className="min-w-full border-separate border-spacing-0">
					<thead>
						{table.getHeaderGroups().map(hg => (
							<tr key={hg.id}>
								{hg.headers.map((header, i) => {
									const col = header.column;
									const canSort = col.getCanSort();
									const isSorted = col.getIsSorted();
									const isLast = i === hg.headers.length - 1;

									return (
										<th
											key={header.id}
											scope="col"
											className={[
												'sticky top-0 z-10 px-3 py-2 text-left text-xs font-semibold text-slate-700',
												'border-b border-[var(--color-border)]',
												!isLast ? 'border-r border-[var(--color-border)]' : ''
											].join(' ')}
										>
											<button
												type="button"
												onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
												className={[
													'inline-flex items-center gap-2',
													canSort ? 'cursor-pointer select-none' : 'cursor-default'
												].join(' ')}
												disabled={!canSort}
											>
												<span>
													{flexRender(header.column.columnDef.header, header.getContext())}
												</span>
												{canSort ? (
													<span className="text-[10px]">
														{isSorted === 'asc' ? '▲' : isSorted === 'desc' ? '▼' : '↕'}
													</span>
												) : null}
											</button>
										</th>
									);
								})}
							</tr>
						))}
					</thead>

					<tbody className="divide-y divide-slate-200">
						{loading ? (
							<tr>
								<td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
									<span className="inline-flex items-center gap-2">
										<span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent" />
										Loading…
									</span>
								</td>
							</tr>
						) : transactions.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-slate-500">
									No transactions found
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map(row => (
								<tr key={row.original.id} className="odd:bg-gray-900/50 bg-gray-900 hover:bg-blue-500/30">
									{row.getVisibleCells().map((cell, i) => {
										const isLast = i === row.getVisibleCells().length - 1;
										return (
											<td
												key={cell.id}
												className={[
													'px-3 py-3 align-middle text-sm',
													!isLast ? 'border-r border-[var(--color-border)]' : ''
												].join(' ')}
											>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex flex-col gap-2 border-t border-[var(--color-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="text-xs text-slate-600">
					{total === 0 ? '0' : `${startIdx}-${endIdx}`} of {total}
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						onClick={() => onPageChange(1)}
						disabled={safePage <= 1 || loading}
					>
						First
					</button>
					<button
						type="button"
						className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						onClick={() => onPageChange(safePage - 1)}
						disabled={safePage <= 1 || loading}
					>
						Prev
					</button>

					<div className="px-1 text-xs text-slate-600">
						Page {safePage} / {totalPages}
					</div>

					<button
						type="button"
						className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						onClick={() => onPageChange(safePage + 1)}
						disabled={safePage >= totalPages || loading}
					>
						Next
					</button>
					<button
						type="button"
						className="rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
						onClick={() => onPageChange(totalPages)}
						disabled={safePage >= totalPages || loading}
					>
						Last
					</button>
				</div>
			</div>
		</div>
	);
}
