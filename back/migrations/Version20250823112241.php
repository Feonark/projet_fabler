<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250823112241 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // On écrase les anciennes valeurs par le timestamp courant
        $this->addSql("ALTER TABLE message ALTER COLUMN created_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE USING now()");
        $this->addSql("COMMENT ON COLUMN message.created_at IS '(DC2Type:datetime_immutable)'");
    }

    public function down(Schema $schema): void
    {
        $this->addSql("ALTER TABLE message ALTER COLUMN created_at TYPE TIME(0) WITHOUT TIME ZONE USING created_at::time");
        $this->addSql("COMMENT ON COLUMN message.created_at IS '(DC2Type:time_immutable)'");
    }
}
