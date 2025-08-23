<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Link;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use App\State\StoryMemberStateProcessor;
use App\Repository\StoryMemberRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: StoryMemberRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['member:read', 'user:item:read', 'story:item:read', 'chat:item:read', 'message:list:read']],
    denormalizationContext: ['groups' => ['member:create', 'member:edit']],
    operations: [
        new Post(
            processor: StoryMemberStateProcessor::class,
            normalizationContext: ['groups' => ['member:read']],
            denormalizationContext: ['groups' => ['member:create']],
            security: "is_granted('ROLE_USER')"
        ),
        new Patch(
            processor: StoryMemberStateProcessor::class,
            normalizationContext: ['groups' => ['member:read']],
            denormalizationContext: ['groups' => ['member:edit']],
            security: "is_granted('STORY_MEMBER_EDIT', object)"
        ),
        new Delete(
            security: "is_granted('STORY_MEMBER_DELETE', object)"
        ),
    ]
)]
class StoryMember
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['member:read', 'user:item:read', 'story:item:read', 'chat:item:read', 'message:list:read', 'message:item:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['member:read', 'member:edit'])]
    private ?bool $isAccepted = false;

    #[ORM\Column]
    private ?bool $isAuthor = null;

    #[ORM\ManyToOne(inversedBy: 'storyMemberships')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['story:item:read', 'chat:item:read', 'message:list:read', 'message:item:read'])]
    private ?User $memberUser = null;

    #[ORM\OneToOne(cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['chat:item:read'])]
    private ?MemberChatStatus $memberChatStatus = null;

    #[ORM\ManyToOne(inversedBy: 'members')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['user:item:read', 'member:create'])]
    #[ApiProperty(writableLink: false)]
    private ?Story $story = null;

    #[ORM\ManyToOne(inversedBy: 'members')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Chat $chat = null;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'author')]
    private Collection $messages;

    public function __construct()
    {
        $this->messages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    #[Groups(['story:item:read', 'chat:item:read', 'user:item:read'])]
    public function isAccepted(): ?bool
    {
        return $this->isAccepted;
    }

    public function setIsAccepted(bool $isAccepted): static
    {
        $this->isAccepted = $isAccepted;

        return $this;
    }

    #[Groups(['user:item:read', 'story:item:read'])]
    public function isAuthor(): ?bool
    {
        return $this->isAuthor;
    }

    public function setIsAuthor(bool $isAuthor): static
    {
        $this->isAuthor = $isAuthor;

        return $this;
    }

    public function getMemberUser(): ?User
    {
        return $this->memberUser;
    }

    public function setMemberUser(?User $memberUser): static
    {
        $this->memberUser = $memberUser;

        return $this;
    }

    public function getMemberChatStatus(): ?MemberChatStatus
    {
        return $this->memberChatStatus;
    }

    public function setMemberChatStatus(MemberChatStatus $memberChatStatus): static
    {
        $this->memberChatStatus = $memberChatStatus;

        return $this;
    }

    public function getStory(): ?Story
    {
        return $this->story;
    }

    public function setStory(?Story $story): static
    {
        $this->story = $story;

        return $this;
    }

    public function getChat(): ?Chat
    {
        return $this->chat;
    }

    public function setChat(?Chat $chat): static
    {
        $this->chat = $chat;

        return $this;
    }

    /**
     * @return Collection<int, Message>
     */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function addMessage(Message $message): static
    {
        if (!$this->messages->contains($message)) {
            $this->messages->add($message);
            $message->setAuthor($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getAuthor() === $this) {
                $message->setAuthor(null);
            }
        }

        return $this;
    }
}
