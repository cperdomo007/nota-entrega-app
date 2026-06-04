ALTER TABLE `serials` ADD CONSTRAINT `serials_line_serial_unique` UNIQUE(`lineId`,`serial`);--> statement-breakpoint
CREATE INDEX `note_lines_note_id_idx` ON `note_lines` (`noteId`);--> statement-breakpoint
CREATE INDEX `note_lines_product_id_idx` ON `note_lines` (`productId`);--> statement-breakpoint
CREATE INDEX `serials_line_id_idx` ON `serials` (`lineId`);
