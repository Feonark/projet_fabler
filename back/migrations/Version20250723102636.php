<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250723102636 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE character (id SERIAL NOT NULL, owner_id INT NOT NULL, hash_id VARCHAR(6) DEFAULT NULL, name VARCHAR(30) NOT NULL, title VARCHAR(40) DEFAULT NULL, bio TEXT DEFAULT NULL, portrait_url VARCHAR(255) NOT NULL, avatar_url VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_937AB0347E3C61F9 ON character (owner_id)');
        $this->addSql('CREATE TABLE character_story (character_id INT NOT NULL, story_id INT NOT NULL, PRIMARY KEY(character_id, story_id))');
        $this->addSql('CREATE INDEX IDX_1595E35A1136BE75 ON character_story (character_id)');
        $this->addSql('CREATE INDEX IDX_1595E35AAA5D4036 ON character_story (story_id)');
        $this->addSql('CREATE TABLE chat (id SERIAL NOT NULL, story_id INT NOT NULL, current_place_id INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_659DF2AAAA5D4036 ON chat (story_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_659DF2AA90DED833 ON chat (current_place_id)');
        $this->addSql('CREATE TABLE member_chat_status (id SERIAL NOT NULL, is_online BOOLEAN NOT NULL, is_writing BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE message (id SERIAL NOT NULL, character_alias_id INT NOT NULL, author_id INT NOT NULL, chat_id INT NOT NULL, content TEXT NOT NULL, created_at TIME(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B6BD307F657A373 ON message (character_alias_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON message (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F1A9A7125 ON message (chat_id)');
        $this->addSql('COMMENT ON COLUMN message.created_at IS \'(DC2Type:time_immutable)\'');
        $this->addSql('CREATE TABLE place (id SERIAL NOT NULL, story_id INT NOT NULL, hash_id VARCHAR(6) DEFAULT NULL, title VARCHAR(50) NOT NULL, description TEXT NOT NULL, place_image_url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_741D53CDAA5D4036 ON place (story_id)');
        $this->addSql('CREATE TABLE story (id SERIAL NOT NULL, author_id INT NOT NULL, hash_id VARCHAR(6) DEFAULT NULL, title VARCHAR(50) NOT NULL, description TEXT DEFAULT NULL, banner_image_url VARCHAR(255) DEFAULT NULL, is_public BOOLEAN NOT NULL, genre_type VARCHAR(255) NOT NULL, audience_type VARCHAR(255) NOT NULL, access_type VARCHAR(255) NOT NULL, language_type VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_EB560438F675F31B ON story (author_id)');
        $this->addSql('CREATE TABLE story_member (id SERIAL NOT NULL, member_user_id INT NOT NULL, member_chat_status_id INT NOT NULL, story_id INT NOT NULL, chat_id INT NOT NULL, is_accepted BOOLEAN NOT NULL, is_author BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_3FE7488A189A6401 ON story_member (member_user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3FE7488AA9F7CB75 ON story_member (member_chat_status_id)');
        $this->addSql('CREATE INDEX IDX_3FE7488AAA5D4036 ON story_member (story_id)');
        $this->addSql('CREATE INDEX IDX_3FE7488A1A9A7125 ON story_member (chat_id)');
        $this->addSql('CREATE TABLE "user" (id SERIAL NOT NULL, username VARCHAR(30) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL, birthdate DATE DEFAULT NULL, description TEXT DEFAULT NULL, avatar_url VARCHAR(255) DEFAULT NULL, created_at DATE NOT NULL, is_online BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME ON "user" (username)');
        $this->addSql('COMMENT ON COLUMN "user".created_at IS \'(DC2Type:date_immutable)\'');
        $this->addSql('ALTER TABLE character ADD CONSTRAINT FK_937AB0347E3C61F9 FOREIGN KEY (owner_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE character_story ADD CONSTRAINT FK_1595E35A1136BE75 FOREIGN KEY (character_id) REFERENCES character (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE character_story ADD CONSTRAINT FK_1595E35AAA5D4036 FOREIGN KEY (story_id) REFERENCES story (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AAAA5D4036 FOREIGN KEY (story_id) REFERENCES story (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE chat ADD CONSTRAINT FK_659DF2AA90DED833 FOREIGN KEY (current_place_id) REFERENCES place (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F657A373 FOREIGN KEY (character_alias_id) REFERENCES character (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES story_member (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F1A9A7125 FOREIGN KEY (chat_id) REFERENCES chat (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE place ADD CONSTRAINT FK_741D53CDAA5D4036 FOREIGN KEY (story_id) REFERENCES story (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE story ADD CONSTRAINT FK_EB560438F675F31B FOREIGN KEY (author_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE story_member ADD CONSTRAINT FK_3FE7488A189A6401 FOREIGN KEY (member_user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE story_member ADD CONSTRAINT FK_3FE7488AA9F7CB75 FOREIGN KEY (member_chat_status_id) REFERENCES member_chat_status (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE story_member ADD CONSTRAINT FK_3FE7488AAA5D4036 FOREIGN KEY (story_id) REFERENCES story (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE story_member ADD CONSTRAINT FK_3FE7488A1A9A7125 FOREIGN KEY (chat_id) REFERENCES chat (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE character DROP CONSTRAINT FK_937AB0347E3C61F9');
        $this->addSql('ALTER TABLE character_story DROP CONSTRAINT FK_1595E35A1136BE75');
        $this->addSql('ALTER TABLE character_story DROP CONSTRAINT FK_1595E35AAA5D4036');
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AAAA5D4036');
        $this->addSql('ALTER TABLE chat DROP CONSTRAINT FK_659DF2AA90DED833');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F657A373');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307FF675F31B');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F1A9A7125');
        $this->addSql('ALTER TABLE place DROP CONSTRAINT FK_741D53CDAA5D4036');
        $this->addSql('ALTER TABLE story DROP CONSTRAINT FK_EB560438F675F31B');
        $this->addSql('ALTER TABLE story_member DROP CONSTRAINT FK_3FE7488A189A6401');
        $this->addSql('ALTER TABLE story_member DROP CONSTRAINT FK_3FE7488AA9F7CB75');
        $this->addSql('ALTER TABLE story_member DROP CONSTRAINT FK_3FE7488AAA5D4036');
        $this->addSql('ALTER TABLE story_member DROP CONSTRAINT FK_3FE7488A1A9A7125');
        $this->addSql('DROP TABLE character');
        $this->addSql('DROP TABLE character_story');
        $this->addSql('DROP TABLE chat');
        $this->addSql('DROP TABLE member_chat_status');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE place');
        $this->addSql('DROP TABLE story');
        $this->addSql('DROP TABLE story_member');
        $this->addSql('DROP TABLE "user"');
    }
}
