<?php

namespace App\Controller;

use App\Repository\StoryRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class TestController extends AbstractController
{
  #[Route('/debug/story/{id}', name: 'debug_story')]
  public function debugStory(int $id, StoryRepository $storyRepository): Response
  {
    $story = $storyRepository->find($id);

    // Dump le nombre de characters liés dans l'objet Story
    dd([
      'story_id' => $story->getId(),
      'character_count' => count($story->getCharacters()),
      'characters' => $story->getCharacters()->toArray()
    ]);
  }
}
