<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250819081203 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F657A373');
        $this->addSql('ALTER TABLE message ALTER character_alias_id DROP NOT NULL');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F657A373 FOREIGN KEY (character_alias_id) REFERENCES character (id) ON DELETE SET NULL NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT fk_b6bd307f657a373');
        $this->addSql('ALTER TABLE message ALTER character_alias_id SET NOT NULL');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT fk_b6bd307f657a373 FOREIGN KEY (character_alias_id) REFERENCES "character" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }
}
