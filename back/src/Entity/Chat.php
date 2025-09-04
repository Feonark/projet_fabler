<?php

namespace App\Entity;

use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\Patch;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\ChatRepository;
use ApiPlatform\Metadata\ApiResource;
use App\State\ChatStateProvider;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

#[ORM\Entity(repositoryClass: ChatRepository::class)]
#[ApiResource(
    mercure: 'object.getMercureOptions()',
    normalizationContext: ['groups' => ['chat:read', 'chat:item:read']],
    denormalizationContext: ['groups' => ['chat:edit']],
    operations: [
        new Get(
            provider: ChatStateProvider::class,
            normalizationContext: ['groups' => ['chat:item:read']],
            security: "is_granted('CHAT_VIEW', object)"
        ),
        new Patch(
            normalizationContext: ['groups' => ['chat:read']],
            denormalizationContext: ['groups' => ['chat:edit']],
            security: "is_granted('CHAT_EDIT', object)"
        )
    ]
)]
class Chat
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['chat:read', 'chat:item:read'])]
    private ?int $id = null;

    /**
     * @var Collection<int, StoryMember>
     */
    #[ORM\OneToMany(
        targetEntity: StoryMember::class,
        mappedBy: 'chat',
        cascade: ['remove'],
        orphanRemoval: true
    )]
    #[Groups(['chat:item:read'])]
    private Collection $members;

    /**
     * @var Collection<int, Message>
     */
    #[ORM\OneToMany(targetEntity: Message::class, mappedBy: 'chat', orphanRemoval: true)]
    private Collection $messages;

    #[ORM\OneToOne(inversedBy: 'chat', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['chat:item:read'])]
    private ?Story $story = null;

    #[ORM\OneToOne(inversedBy: 'chat', cascade: ['persist', 'remove'])]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['chat:item:read', 'chat:edit'])]
    private ?Place $currentPlace = null;

    public function __construct()
    {
        $this->members = new ArrayCollection();
        $this->messages = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection<int, StoryMember>
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(StoryMember $member): static
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
            $member->setChat($this);
        }

        return $this;
    }

    public function removeMember(StoryMember $member): static
    {
        if ($this->members->removeElement($member)) {
            // set the owning side to null (unless already changed)
            if ($member->getChat() === $this) {
                $member->setChat(null);
            }
        }

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
            $message->setChat($this);
        }

        return $this;
    }

    public function removeMessage(Message $message): static
    {
        if ($this->messages->removeElement($message)) {
            // set the owning side to null (unless already changed)
            if ($message->getChat() === $this) {
                $message->setChat(null);
            }
        }

        return $this;
    }

    public function getStory(): ?Story
    {
        return $this->story;
    }

    public function setStory(Story $story): static
    {
        $this->story = $story;

        return $this;
    }

    public function getCurrentPlace(): ?Place
    {
        return $this->currentPlace;
    }

    public function setCurrentPlace(Place $currentPlace): static
    {
        $this->currentPlace = $currentPlace;

        return $this;
    }

    public function getMercureOptions(): array
    {
        $topic1 = '@=iri(object)';

        return [
            'private' => true,
            'topics' => [
                $topic1,
            ],
        ];
    }
}
