CREATE TABLE `company_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`rif` varchar(50),
	`businessName` text,
	`address` text,
	`phone1` varchar(20),
	`phone2` varchar(20),
	`email` varchar(255),
	`website` varchar(255),
	`ivaRate` decimal(5,2) DEFAULT '16.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noteNumber` varchar(50) NOT NULL,
	`noteDate` date NOT NULL,
	`clientName` text NOT NULL,
	`clientRif` varchar(50),
	`clientAddress` text,
	`clientPhone` varchar(20),
	`clientContact` varchar(100),
	`subtotal` decimal(12,2) DEFAULT '0',
	`ivaAmount` decimal(12,2) DEFAULT '0',
	`total` decimal(12,2) DEFAULT '0',
	`observations` text,
	`deliveredBy` varchar(100),
	`receivedBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `delivery_notes_id` PRIMARY KEY(`id`),
	CONSTRAINT `delivery_notes_noteNumber_unique` UNIQUE(`noteNumber`)
);
--> statement-breakpoint
CREATE TABLE `note_lines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`noteId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`lineTotal` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `note_lines_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`barcode` varchar(255),
	`name` text NOT NULL,
	`description` text,
	`category` varchar(100),
	`price` decimal(10,2) NOT NULL,
	`unit` varchar(50) DEFAULT 'UN',
	`hasSerial` boolean DEFAULT false,
	`stock` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_barcode_unique` UNIQUE(`barcode`)
);
--> statement-breakpoint
CREATE TABLE `serials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lineId` int NOT NULL,
	`serial` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `serials_id` PRIMARY KEY(`id`)
);
