import React, { createContext, useContext, useState } from 'react';

import { cn } from '@/lib/utils.js';

interface TabsContextType {
	activeTab: string;
	setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
	defaultValue?: string;
	value?: string;
	onValueChange?: (value: string) => void;
	children: React.ReactNode;
	className?: string;
}

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) => {
	const [internalValue, setInternalValue] = useState(defaultValue || '');

	const activeTab = value !== undefined ? value : internalValue;

	const handleTabChange = (newValue: string) => {
		if (value === undefined) {
			setInternalValue(newValue);
		}
		onValueChange?.(newValue);
	};

	return (
		<TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
			<div className={className} {...props}>
				{children}
			</div>
		</TabsContext.Provider>
	);
};

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		role="tablist"
		className={cn(
			'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground bg-(--color-primary) text-primary hover:bg-[--background-secondary]',
			className
		)}
		{...props}
	/>
));

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	value: string;
	children: React.ReactNode;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
	({ className, value, children, onClick, ...props }, ref) => {
		const context = useContext(TabsContext);

		if (!context) {
			throw new Error('TabsTrigger must be used within a Tabs component');
		}

		const { activeTab, setActiveTab } = context;
		const isActive = activeTab === value;

		const handleClick = (e: any) => {
			setActiveTab(value);
			onClick?.(e);
		};

		return (
			<button
				ref={ref}
				role="tab"
				aria-selected={isActive}
				data-state={isActive ? 'active' : 'inactive'}
				onClick={handleClick}
				className={cn(
					'cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-black/50 data-[state=active]:text-foreground data-[state=active]:shadow-sm',
					className
				)}
				{...props}
			>
				{children}
			</button>
		);
	}
);

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
	value: string;
	children: React.ReactNode;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
	({ className, value, children, ...props }, ref) => {
		const context = useContext(TabsContext);

		if (!context) {
			throw new Error('TabsContent must be used within a Tabs component');
		}

		const { activeTab } = context;
		const isActive = activeTab === value;

		if (!isActive) {
			return null;
		}

		return (
			<div
				ref={ref}
				role="tabpanel"
				data-state={'active'}
				className={cn(
					'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
