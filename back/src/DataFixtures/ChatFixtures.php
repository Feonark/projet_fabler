<?php

namespace App\DataFixtures;

use App\Entity\Chat;
use App\Entity\Story;
use App\DataFixtures\PlaceFixtures;
use App\DataFixtures\StoryFixtures;
use App\DataFixtures\MessageFixtures;
use Doctrine\Persistence\ObjectManager;
use App\DataFixtures\StoryMemberFixtures;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class ChatFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    // Création de 10 Chat
    for ($i = 0; $i < 10; $i++) {
      $chat = new Chat();

      // Récupération de la Story associée
      $story = $this->getReference('story_' . $i, Story::class);
      $chat->setStory($story);

      // Récupération des places de cette story
      $places = $story->getPlaces();

      if (!$places->isEmpty()) {
        $placesArray = $places->toArray();
        $randomPlace = $placesArray[array_rand($placesArray)];
        $chat->setCurrentPlace($randomPlace);
      }

      $manager->persist($chat);
      $this->addReference('chat_' . $i, $chat);
    }

    $manager->flush();
  }

  public function getDependencies(): array
  {
    return [
      StoryFixtures::class,
      PlaceFixtures::class
    ];
  }
}
