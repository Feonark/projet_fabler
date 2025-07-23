<?php

namespace App\DataFixtures;

use Faker\Factory;
use App\Entity\Chat;
use App\Entity\Message;
use App\Entity\Character;
use App\Entity\StoryMember;
use App\DataFixtures\ChatFixtures;
use App\DataFixtures\CharacterFixtures;
use Doctrine\Persistence\ObjectManager;
use App\DataFixtures\StoryMemberFixtures;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class MessageFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');

    // Création de la map User -> Characters
    $userCharacters = [];

    for ($i = 0; $i < 30; $i++) {
      /** @var Character $character */
      $character = $this->getReference('character_' . $i, Character::class);
      $owner = $character->getOwner();
      $userId = spl_object_id($owner); // identifiant unique d'objet

      $userCharacters[$userId][] = $character;
    }

    // Création des messages
    for ($i = 0; $i < 60; $i++) {
      /** @var StoryMember $storyMember */
      $storyMember = $this->getReference('storyMember_' . $faker->numberBetween(0, 39), StoryMember::class);
      $chat = $storyMember->getChat();
      $user = $storyMember->getMemberUser();
      $userId = spl_object_id($user);

      // Vérifier que ce user a au moins un character
      if (!isset($userCharacters[$userId]) || empty($userCharacters[$userId])) {
        continue; // on skip ce message
      }

      $character = $faker->randomElement($userCharacters[$userId]);

      $message = new Message();
      $message
        ->setContent($faker->text(400))
        ->setCreatedAt(\DateTimeImmutable::createFromMutable($faker->dateTime()))
        ->setChat($chat)
        ->setAuthor($storyMember)
        ->setCharacterAlias($character);

      $manager->persist($message);
    }

    $manager->flush();
  }


  public function getDependencies(): array
  {
    return [
      CharacterFixtures::class,
      StoryMemberFixtures::class,
      ChatFixtures::class
    ];
  }
}
