<?php

namespace App\Controller;

use App\Entity\StoryMember;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\Response;
use ApiPlatform\Metadata\IriConverterInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MercureAuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $em,
        private Security $security,
        private IriConverterInterface $iriConverter
    ) {}

    #[Route('/api/mercure-auth', name: 'mercure_auth', methods: ['POST'])]
    public function __invoke(): Response
    {
        $user = $this->security->getUser();
        if (!$user) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $storyMembers = $this->em->getRepository(StoryMember::class)->findBy([
            'memberUser' => $user,
            'isAccepted' => true,
        ]);

        if (!$storyMembers) {
            return $this->json(['error' => 'Forbidden'], Response::HTTP_FORBIDDEN);
        }

        $secret = $_ENV['MERCURE_JWT_SECRET'];
        $topics = [];

        foreach ($storyMembers as $storyMember) {
            $chat = $storyMember->getChat();
            if (!$chat) {
                continue;
            }

            // Abonnement aux messages du chat
            $topics[] = $this->iriConverter->getIriFromResource($chat, UrlGeneratorInterface::ABSOLUTE_URL) . '/messages';
            $topics[] = $this->iriConverter->getIriFromResource($chat, UrlGeneratorInterface::ABSOLUTE_URL);

            // Abonnement aux statuts des membres de ce chat
            foreach ($chat->getMembers() as $member) {
                if ($member->getMemberChatStatus()) {
                    $topics[] = $this->iriConverter->getIriFromResource($member->getMemberChatStatus(), UrlGeneratorInterface::ABSOLUTE_URL);
                }
            }
        }

        $header = $this->base64UrlEncode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = $this->base64UrlEncode(json_encode([
            'mercure' => ['subscribe' => $topics],
            'exp' => (new \DateTime('+2 hours'))->getTimestamp(),
        ]));
        $signature = $this->base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );
        $jwt = "$header.$payload.$signature";

        $cookie = Cookie::create('mercureAuthorization', $jwt)
            ->withDomain('.fabler.fr')
            ->withSecure(true)
            ->withHttpOnly(true)
            ->withSameSite('none')
            ->withPath('/')
            ->withExpires(new \DateTime('+2 hours'));

        $response = new Response(null, Response::HTTP_NO_CONTENT);
        $response->headers->setCookie($cookie);

        return $response;
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}
