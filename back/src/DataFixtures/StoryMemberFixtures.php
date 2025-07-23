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
use App\DataFixtures\MessageFixtures;
use Doctrine\Persistence\ObjectManager;
use Doctrine\Bundle\FixturesBundle\Fixture;
use App\DataFixtures\MemberChatStatusFixtures;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class StoryMemberFixtures extends Fixture implements DependentFixtureInterface
{
  public function load(ObjectManager $manager): void
  {
    $faker = Factory::create('en_US');

    // Création de 40 StoryMembers
    for ($i = 0; $i < 40; $i++) {
      $storyMember = new StoryMember();

      // Assignation de MemberUser
      $member = $this->getReference('user_' . $faker->numberBetween(0, 9), User::class);
      $storyMember->setMemberUser($member);

      // Assignation de MemberChatStatus
      $memberChatStatus = $this->getReference('memberChatStatus_' . $i, MemberChatStatus::class);
      $storyMember->setMemberChatStatus($memberChatStatus);

      // Assignation de Story et Chat
      $randomIndex = $faker->numberBetween(0, 9);

      $story = $this->getReference('story_' . $randomIndex, Story::class);
      $storyMember->setStory($story);

      $chat = $this->getReference('chat_' . $randomIndex, Chat::class);
      $storyMember->setChat($chat);

      // Assignation de isAuthor
      $isAuthor = $story->getAuthor()->getId() === $member->getId();
      $storyMember->setIsAuthor($isAuthor);

      // isAccepted est toujours true si isAuthor, sinon aléatoire
      $storyMember->setIsAccepted($isAuthor ? true : $faker->boolean(50));

      // Assignation de Messages dans MessageFixtures

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
