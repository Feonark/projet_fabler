<?php

namespace App\DataFixtures;

use Faker\Factory;
use App\Entity\Chat;
use App\Entity\User;
use App\Entity\Story;
use App\Entity\StoryMember;
use App\Entity\MemberChatStatus;
use App\DataFixtures\ChatFixtures;
use App\DataFixtures\UserFixtures;
use App\DataFixtures\StoryFixtures;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use App\DataFixtures\MemberChatStatusFixtures;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class StoryMemberFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');
    $usedPairs = []; // éviter doublons (story, user)

    // Ajouter un auteur par story
    for ($i = 0; $i < 10; $i++) {
      $story = $this->getReference('story_' . $i, Story::class);
      $chat = $this->getReference('chat_' . $i, Chat::class);
      $author = $story->getAuthor();

      $storyMember = new StoryMember();
      $storyMember->setStory($story);
      $storyMember->setChat($chat);
      $storyMember->setMemberUser($author);
      $storyMember->setIsAuthor(true);
      $storyMember->setIsAccepted(true);
      $storyMember->setMemberChatStatus($this->getReference('memberChatStatus_' . $i, MemberChatStatus::class));

      $usedPairs[] = $story->getId() . '_' . $author->getId();

      $manager->persist($storyMember);
      $this->addReference('storyMember_' . $i, $storyMember);
    }

    // Ajouter 30 membres aléatoires
    for ($i = 10; $i < 40; $i++) {
      $storyMember = new StoryMember();

      // Random user/story
      $userIndex = $faker->numberBetween(0, 9);
      $storyIndex = $faker->numberBetween(0, 9);
      $user = $this->getReference('user_' . $userIndex, User::class);
      $story = $this->getReference('story_' . $storyIndex, Story::class);
      $chat = $this->getReference('chat_' . $storyIndex, Chat::class);

      // éviter doublon story/auteur déjà ajouté
      $pairKey = $story->getId() . '_' . $user->getId();
      if (in_array($pairKey, $usedPairs)) {
        $i--; // réessayer
        continue;
      }
      $usedPairs[] = $pairKey;

      $storyMember->setMemberUser($user);
      $storyMember->setStory($story);
      $storyMember->setChat($chat);
      $storyMember->setIsAuthor(false);
      $storyMember->setIsAccepted($faker->boolean(50));
      $storyMember->setMemberChatStatus($this->getReference('memberChatStatus_' . $i, MemberChatStatus::class));

      $manager->persist($storyMember);
      $this->addReference('storyMember_' . $i, $storyMember);
    }

    $manager->flush();
  }

  public function getDependencies(): array
  {
    return [
      UserFixtures::class,
      MemberChatStatusFixtures::class,
      StoryFixtures::class,
      ChatFixtures::class
    ];
  }
}
